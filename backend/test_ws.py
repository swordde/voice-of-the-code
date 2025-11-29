import asyncio
import websockets
import json

async def test_websocket():
    # Test Ping
    uri_ping = "ws://localhost:8000/ws/ping"
    print(f"Connecting to {uri_ping}...")
    try:
        async with websockets.connect(uri_ping) as websocket:
            response = await websocket.recv()
            print(f"Ping Received: {response}")
    except Exception as e:
        print(f"Ping Connection failed: {e}")

    # Test Interview
    uri = "ws://localhost:8000/ws/interview/test_client?type=technical"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            await websocket.send(json.dumps({"type": "submit_answer", "text": "Hello world"}))
            print("Sent message")
            response = await websocket.recv()
            print(f"Received: {response}")
    except Exception as e:
        print(f"Interview Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
