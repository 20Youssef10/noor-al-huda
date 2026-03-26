import argparse
import json
import os
import sys
import time
import urllib.request
from pathlib import Path


ACCOUNT_ID = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
API_TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN')
INDEX_NAME = os.environ.get('CLOUDFLARE_VECTORIZE_INDEX', 'quran-semantic-index')
MODEL = '@cf/baai/bge-base-en-v1.5'
QURAN_URL = 'https://api.alquran.cloud/v1/quran/quran-uthmani'
CACHE_FILE = Path(__file__).resolve().parent / 'data' / 'quran_ayahs.min.json'


def http_json(url: str, method: str = 'GET', body: bytes | None = None, content_type: str | None = 'application/json'):
    headers = {'Authorization': f'Bearer {API_TOKEN}'} if API_TOKEN else {}
    if content_type:
      headers['Content-Type'] = content_type
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=300) as response:
        payload = response.read()
    return json.loads(payload.decode('utf-8'))


def http_text(url: str, method: str, body: str, content_type: str):
    headers = {'Authorization': f'Bearer {API_TOKEN}', 'Content-Type': content_type}
    request = urllib.request.Request(url, data=body.encode('utf-8'), headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=300) as response:
        payload = response.read()
    return json.loads(payload.decode('utf-8'))


def ensure_index():
    create_url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes'
    body = json.dumps({
        'name': INDEX_NAME,
        'description': 'Semantic Quran ayah embeddings for Noor Al Huda',
        'config': {'dimensions': 768, 'metric': 'cosine'},
    }).encode('utf-8')
    try:
        result = http_json(create_url, method='POST', body=body)
        return result.get('result', {})
    except Exception:
        return None


def load_quran_rows():
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text(encoding='utf-8'))

    with urllib.request.urlopen(QURAN_URL, timeout=300) as response:
        payload = json.load(response)

    rows = []
    for surah in payload['data']['surahs']:
        surah_id = surah['number']
        surah_name = surah['name']
        for ayah in surah['ayahs']:
            rows.append({
                'id': f"{surah_id}:{ayah['numberInSurah']}",
                'surah': surah_id,
                'ayah': ayah['numberInSurah'],
                'surah_name_ar': surah_name,
                'text_ar': ayah['text'],
            })

    CACHE_FILE.write_text(json.dumps(rows, ensure_ascii=False), encoding='utf-8')
    return rows


def embed_batch(texts):
    url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL}'
    body = json.dumps({'text': texts}).encode('utf-8')
    result = http_json(url, method='POST', body=body)
    return result['result']['data'] if 'result' in result else result['data']


def upsert_batch(rows, vectors):
    url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/vectorize/v2/indexes/{INDEX_NAME}/upsert'
    lines = []
    for row, vector in zip(rows, vectors):
        lines.append(json.dumps({
            'id': row['id'],
            'values': vector,
            'metadata': {
                'surah': row['surah'],
                'ayah': row['ayah'],
                'text_ar': row['text_ar'],
                'surah_name_ar': row['surah_name_ar'],
            },
        }, ensure_ascii=False))
    return http_text(url, method='POST', body='\n'.join(lines), content_type='application/x-ndjson')


def main():
    if not ACCOUNT_ID or not API_TOKEN:
        print('Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN', file=sys.stderr)
        raise SystemExit(1)

    parser = argparse.ArgumentParser()
    parser.add_argument('--batch-size', type=int, default=128)
    parser.add_argument('--start', type=int, default=0)
    parser.add_argument('--limit', type=int, default=6236)
    args = parser.parse_args()

    ensure_index()
    rows = load_quran_rows()
    end = min(len(rows), args.start + args.limit)

    processed = 0
    for offset in range(args.start, end, args.batch_size):
        batch = rows[offset: offset + args.batch_size]
        vectors = embed_batch([row['text_ar'] for row in batch])
        upsert_batch(batch, vectors)
        processed += len(batch)
        print(json.dumps({'offset': offset, 'processed': processed, 'total': end - args.start}, ensure_ascii=False))
        time.sleep(0.25)


if __name__ == '__main__':
    main()
