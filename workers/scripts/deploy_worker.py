import json
import os
import urllib.request
from pathlib import Path


ACCOUNT_ID = os.environ['CLOUDFLARE_ACCOUNT_ID']
API_TOKEN = os.environ['CLOUDFLARE_API_TOKEN']
WORKER_NAME = os.environ.get('CLOUDFLARE_WORKER_NAME', 'noor-al-huda-api')
ROOT = Path(__file__).resolve().parent.parent


def main():
    worker_path = ROOT / 'dist' / 'worker.mjs'
    script = worker_path.read_text(encoding='utf-8')
    metadata = {
        'main_module': 'worker.mjs',
        'compatibility_date': '2026-03-26',
        'compatibility_flags': ['nodejs_compat'],
        'bindings': [
            {'type': 'kv_namespace', 'name': 'PRAYER_CACHE', 'namespace_id': '764eae6b3dc940e6b1f53ba7d073808f'},
            {'type': 'kv_namespace', 'name': 'QURAN_CACHE', 'namespace_id': '9c8bad394a15405bbb7533410842b582'},
            {'type': 'kv_namespace', 'name': 'HADITH_CACHE', 'namespace_id': '83adaf9d059b441ea15d4efc7e4fc543'},
            {'type': 'kv_namespace', 'name': 'RADIO_LIST', 'namespace_id': '4c83b16f2dab49e58eafe619865b642f'},
            {'type': 'kv_namespace', 'name': 'AZKAR_CACHE', 'namespace_id': 'd44a5b9f35bc4545960e34ffdb77dd83'},
            {'type': 'plain_text', 'name': 'FIREBASE_PROJECT_ID', 'text': 'noor-al-huda-260326'},
            {'type': 'plain_text', 'name': 'FIREBASE_WEB_API_KEY', 'text': 'AIzaSyA0Q7SFUTkvj8iyzCM2aYk0lDwuxuMNXDE'},
            {'type': 'ai', 'name': 'AI'},
            {'type': 'vectorize', 'name': 'QURAN_VECTORS', 'index_name': 'quran-semantic-index'},
        ],
    }

    boundary = f'----cf-{os.getpid()}'
    body = '\r\n'.join([
        f'--{boundary}',
        'Content-Disposition: form-data; name="metadata"',
        'Content-Type: application/json',
        '',
        json.dumps(metadata),
        f'--{boundary}',
        'Content-Disposition: form-data; name="worker.mjs"; filename="worker.mjs"',
        'Content-Type: application/javascript+module',
        '',
        script,
        f'--{boundary}--',
    ]).encode('utf-8')

    request = urllib.request.Request(
        f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/workers/scripts/{WORKER_NAME}',
        data=body,
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': f'multipart/form-data; boundary={boundary}',
        },
        method='PUT',
    )
    with urllib.request.urlopen(request, timeout=300) as response:
        print(response.read().decode('utf-8'))


if __name__ == '__main__':
    main()
