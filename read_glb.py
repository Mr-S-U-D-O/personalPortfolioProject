import struct, json
with open('models/iphone.glb', 'rb') as f:
    magic, version, length = struct.unpack('<4sII', f.read(12))
    if magic != b'glTF': print('Not a GLB')
    chunk_len, chunk_type = struct.unpack('<II', f.read(8))
    if chunk_type != b'JSON': print('First chunk not JSON')
    json_bytes = f.read(chunk_len)
    gltf = json.loads(json_bytes)
    
    # Print node names and mesh indices
    for i, node in enumerate(gltf.get('nodes', [])):
        print(f"Node {i}: name='{node.get('name', 'N/A')}', mesh={node.get('mesh', 'N/A')}")
    
    for i, mat in enumerate(gltf.get('materials', [])):
        print(f"Material {i}: name='{mat.get('name', 'N/A')}'")
