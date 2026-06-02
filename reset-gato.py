#!/usr/bin/env python3
"""Reseta o estado do gato para um humor-alvo, para testar a UI.

Uso:
    python3 reset-gato.py            # monstro (padrao)
    python3 reset-gato.py grumpy     # mal-humorado
    python3 reset-gato.py neutral    # neutro
    python3 reset-gato.py happy      # radiante

Como funciona: o backend (modelo atual) calcula a felicidade pela razao
concluidas/total * 120. Com 4 tarefas, concluir N delas posiciona o humor:
    0 -> monster | 1 -> grumpy | 2 -> neutral | 3 -> happy
O script limpa o historico, cria 4 tarefas e conclui a quantidade certa.
"""
import json
import sys
import urllib.request

BASE = "http://localhost:8000"
DONE_FOR = {"monster": 0, "grumpy": 1, "neutral": 2, "happy": 3}

TAREFAS = [
    ("Enviar a fatura do cliente", "2026-06-03T18:00:00"),
    ("Marcar o dentista", "2026-06-04T10:00:00"),
    ("Corrigir o bug do login", "2026-06-02T15:00:00"),
    ("Comprar mantimentos", "2026-06-05T20:00:00"),
]


def api(path, method="GET", payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"{BASE}{path}", data=data,
        headers={"Content-Type": "application/json"}, method=method,
    )
    txt = urllib.request.urlopen(req, timeout=20).read().decode()
    return json.loads(txt) if txt else None


def main():
    alvo = (sys.argv[1] if len(sys.argv) > 1 else "monster").lower()
    if alvo not in DONE_FOR:
        print(f"Humor invalido: {alvo}. Use: {', '.join(DONE_FOR)}")
        sys.exit(1)

    # 1) limpa todo o historico
    antigos = api("/flask/tasks/")
    for t in antigos:
        api(f"/flask/tasks/{t['id']}", "DELETE")

    # 2) cria as 4 tarefas
    ids = []
    for nome, data in TAREFAS:
        resp = api("/flask/tasks/", "POST", {"nome": nome, "data_termino": data})
        ids.append((resp.get("task", resp))["id"])

    # 3) conclui a quantidade que posiciona o humor-alvo
    for tid in ids[:DONE_FOR[alvo]]:
        api(f"/flask/tasks/{tid}", "PATCH", {"concluida": True})

    c = api("/api/cat/")
    print(f"Removidas {len(antigos)} antigas. Alvo: {alvo}")
    print(f"Gato agora: mood={c['mood']}  felicidade={c['happiness']}%  "
          f"fome={c['hunger']}%  destruicao={c['destruction_level']}/5")
    print("Recarregue http://localhost:5173/ para ver.")


if __name__ == "__main__":
    main()
