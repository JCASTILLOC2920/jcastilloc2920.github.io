# EJECUTOR AUTÓNOMO DE SUBAGENTES CON SUS PROPIAS API KEYS
import sys
import json
import urllib.request

def run_subagent(agent_name, prompt):
    with open("subagents_pool_config.json", "r", encoding="utf-8") as f:
        cfg = json.load(f)[agent_name]
    
    headers = {
        "Authorization": f"Bearer {cfg['api_key']}",
        "Content-Type": "application/json",
        "User-Agent": "AntigravitySubagent/2.0"
    }
    payload = {
        "model": cfg["model"],
        "messages": [
            {"role": "system", "content": f"Eres el subagente {agent_name}. Especialidad: {cfg['rol']}."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    req = urllib.request.Request(cfg["endpoint"], headers=headers, data=json.dumps(payload).encode("utf-8"))
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(res["choices"][0]["message"]["content"])

if __name__ == "__main__":
    if len(sys.argv) > 2:
        run_subagent(sys.argv[1], sys.argv[2])
    else:
        print("Uso: python subagent_executor.py <NOMBRE_AGENTE> <PROMPT>")
