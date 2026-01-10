#!/usr/bin/env python3
import os
import time
import threading
import queue
import argparse
import http.server

clients = []
clients_lock = threading.Lock()

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/__events':
            self.send_response(200)
            self.send_header('Content-Type', 'text/event-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()
            q = queue.Queue()
            with clients_lock:
                clients.append(q)
            try:
                self.wfile.write(b": connected\n\n")
                self.wfile.flush()
                while True:
                    msg = q.get()
                    data = f"data: {msg}\n\n".encode('utf-8')
                    try:
                        self.wfile.write(data)
                        self.wfile.flush()
                    except BrokenPipeError:
                        break
            except Exception:
                pass
            finally:
                with clients_lock:
                    if q in clients:
                        clients.remove(q)
        else:
            return super().do_GET()

def watch(directory, interval=1.0):
    mtimes = {}
    for root, dirs, files in os.walk(directory):
        for f in files:
            p = os.path.join(root, f)
            try:
                mtimes[p] = os.path.getmtime(p)
            except Exception:
                pass
    while True:
        time.sleep(interval)
        changed = False
        for root, dirs, files in os.walk(directory):
            for f in files:
                p = os.path.join(root, f)
                try:
                    m = os.path.getmtime(p)
                except Exception:
                    continue
                old = mtimes.get(p)
                if old is None:
                    mtimes[p] = m
                    changed = True
                elif m != old:
                    mtimes[p] = m
                    changed = True
        if changed:
            with clients_lock:
                for q in list(clients):
                    try:
                        q.put('reload')
                    except Exception:
                        pass

def run(host, port, directory):
    os.chdir(directory)
    server = http.server.ThreadingHTTPServer((host, port), Handler)
    server.allow_reuse_address = True
    t = threading.Thread(target=watch, args=(directory,), daemon=True)
    t.start()
    print(f"Serving {directory} on http://{host}:{port}/ (SSE at /__events)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('Shutting down')
        server.shutdown()

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--host', default='127.0.0.1')
    p.add_argument('--port', type=int, default=8000)
    p.add_argument('--dir', default='.')
    args = p.parse_args()
    run(args.host, args.port, args.dir)
