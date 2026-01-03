from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If the pixel is close to white, make it transparent
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
    
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_background("e:/文件/iso17025/logo.png", "e:/文件/iso17025/logo_transparent.png")
