import bpy
import os 

import bpy.utils.previews
from bpy.utils import previews
import json

bl_info = {
    "name": "Fluid Kit", 
    "author": "sheep, MeiU",
    "version": (1, 0, 1),
    "blender": (3, 4, 0),
    "location": "View3D > Fluid Kit",
}

Dev_Mode = False

Auto_Adaptive_Text = True
#自適應文字換行函數
#預設每15個字元自動換行 函數需要輸入文字資訊與latout資訊以及幾個字換行
def adaptive_text_wrap(text, layout, max_width=15):
    # 將文字按 max_width 切割成多行
    # 先按句點分割
    sentences = text.split(". ")
    
    # 處理每個句子
    for sentence in sentences:
        if sentence:  # 確保句子不為空
            # 如果不是最後一個句子，加回句點
            if sentence != sentences[-1]:
                sentence = sentence + "."
                
            # 將句子按 max_width 切割成多行
            lines = [sentence[i:i+max_width] for i in range(0, len(sentence), max_width)]
            for line in lines:
                layout.label(text=line)


# Assets Lib

# Get current path
if True:
    current_path = os.path.dirname(os.path.abspath(__file__))
else:
    current_path = r""

# Preset library path    
presets_library_base_Assets = os.path.join(current_path, "assets", "presets_library", "Assets")
presets_library_info_path = os.path.join(current_path, "assets", "presets_library")

presets_library_base_GN = os.path.join(current_path, "assets", "presets_library", "GN_Assets")
presets_library_base_Materials = os.path.join(current_path, "assets", "presets_library", "Materials")

assets_library_path = os.path.join(current_path, "assets", "assets_library")

Models_library_path = os.path.join(current_path, "assets", "assets_library", "Models.blend")    
materials_library_path = os.path.join(current_path, "assets", "assets_library", "Materials.blend")    
GeoNode_library_path = os.path.join(current_path, "assets", "assets_library", "GeoNode.blend")

ui_icon_path = os.path.join(current_path, "assets", "ui_icon")
preview_collections = {}

def get_assets_info(Assets_Name):
    # 獲取選擇項目所在的文件夾名稱，而不是項目名稱本身
    folder_name = os.path.dirname(bpy.context.scene.fluidkit_assets_enum).split(os.path.sep)[-1]
    
    # 在 assets_library_path 中尋找與 folder_name 同名的 .blend 檔案
    info_json_file_path = os.path.join(assets_library_path, f"{folder_name}.json")

    # 檢查檔案是否存在
    if os.path.exists(info_json_file_path):
        pass
    else:
        return None, None
    
    # return face_count , id
    with open(info_json_file_path, 'r') as f:
        assets_info = json.load(f)
    for asset in assets_info:
        if asset["name"] == Assets_Name:
            return asset["face_count"], asset["id"]
    return None, None

# load ui icon
def load_icons(directory):
    icons = previews.new()
    icon_names = []  
    
    for root, dirs, files in os.walk(directory):
        for filename in files:
            if filename.lower().endswith(('.png', '.jpg')):
                icon_name = os.path.splitext(filename)[0]
                icon_path = os.path.join(root, filename)
                icons.load(icon_name, icon_path, 'IMAGE')
                icon_names.append(icon_name)  
    
    log_file_path = os.path.join(directory, 'icon_list.txt')  
    with open(log_file_path, 'w') as file:
        for name in icon_names:
            file.write(name + '\n')
    return icons

fluid_kit_icons_assets_directory = os.path.join(current_path, 'assets', 'ui_icon')
fluid_kit_ui_icons = load_icons(fluid_kit_icons_assets_directory)

# update UI
def update_ui():
    for a in bpy.context.screen.areas:
        a.tag_redraw()

# Get preset library path based on version (僅處理 Assets 與 GN_Assets)
def get_presets_library_base(context):
    # 當選擇 Assets 時使用 Assets 路徑，GN_Assets 時使用 GN_Assets 路徑
    if context.scene.fluid_kit_prop_group.fluidkit_lib == "Assets":
        return presets_library_base_Assets
    elif context.scene.fluid_kit_prop_group.fluidkit_lib == "GN_Assets":
        return presets_library_base_GN

# 更新上方 Assets 與 GN_Assets 的預覽圖（不包含 Materials）
def update_assets_previews(self, context):
    if Dev_Mode:
        print("update_assets_previews")
    if not hasattr(context, 'scene'):
        return

    from bpy.types import Scene
    from bpy.props import EnumProperty

    scn = context.scene
    preset_type = scn.fluid_kit_prop_group.presets_type

    # --------------- 載入 Assets 與 GN_Assets 的預覽圖 ------------------
    pcoll = preview_collections.get("my_previews")
    if pcoll:
        pcoll.clear()
    else:
        pcoll = bpy.utils.previews.new()
        preview_collections["my_previews"] = pcoll

    image_paths_main = []
    # 根據目前選擇的 fluidkit_lib (僅有 Assets 或 GN_Assets) 取得預設路徑
    presets_library_base = get_presets_library_base(context)
    if preset_type == "ALL":
        # 遍歷所有子資料夾
        for folder in os.listdir(presets_library_base):
            folder_path = os.path.join(presets_library_base, folder)
            if os.path.isdir(folder_path):
                for fn in os.listdir(folder_path):
                    if fn.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tga")):
                        filepath = os.path.join(folder_path, fn)
                        image_paths_main.append(filepath)
                        pcoll.load(filepath, filepath, 'IMAGE')
    else:
        presets_library = os.path.join(presets_library_base, preset_type)
        print(f"Loading presets from: {presets_library}")  # Debug
        if os.path.exists(presets_library):
            for fn in os.listdir(presets_library):
                if fn.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tga")):
                    filepath = os.path.join(presets_library, fn)
                    image_paths_main.append(filepath)
                    pcoll.load(filepath, filepath, 'IMAGE')

    items_main = []
    for idx, filepath in enumerate(image_paths_main):
        icon = pcoll[filepath].icon_id
        image_name = os.path.splitext(os.path.basename(filepath))[0]
        items_main.append((filepath, image_name, "", icon, idx))

    bpy.types.Scene.fluidkit_assets_enum = EnumProperty(
        items=items_main,
        description="Select an image for Fluid Kit Assets",
        name="",
    )
    bpy.types.Scene.fluidkit_gn_assets_enum = EnumProperty(
        items=items_main,
        description="Select an image for Fluid Kit GN_Assets",
        name="",
    )

    if items_main:
        scn.fluidkit_assets_enum = items_main[0][0]
        scn.fluidkit_gn_assets_enum = items_main[0][0]

    update_ui()

# 當切換 Type 時呼叫此函式，重置 presets_type 為 "ALL"，再更新上方預覽圖
def update_assets_previews_from_type(self, context):
    if Dev_Mode:
        print("update_assets_previews_from_type")
    scn = context.scene
    if scn.fluid_kit_prop_group.presets_type != "ALL":
        scn.fluid_kit_prop_group.presets_type = "ALL"
    update_assets_previews(self, context)

# 更新下方 Materials 的預覽圖（僅顯示 Materials 庫內的圖片）
def update_materials_previews(self, context):
    if Dev_Mode:
        print("update_materials_previews")
    if not hasattr(context, 'scene'):
        return

    from bpy.types import Scene
    from bpy.props import EnumProperty

    scn = context.scene
    material_preset_type = scn.fluid_kit_prop_group.materials_presets_type

    # --------------- 載入 Materials 的預覽圖 ------------------
    pcoll_materials = preview_collections.get("materials_previews")
    if pcoll_materials:
        pcoll_materials.clear()
    else:
        pcoll_materials = bpy.utils.previews.new()
        preview_collections["materials_previews"] = pcoll_materials

    image_paths_materials = []
    materials_library = presets_library_base_Materials
    if material_preset_type == "ALL":
        for folder in os.listdir(materials_library):
            folder_path = os.path.join(materials_library, folder)
            if os.path.isdir(folder_path):
                for fn in os.listdir(folder_path):
                    if fn.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tga")):
                        filepath = os.path.join(folder_path, fn)
                        image_paths_materials.append(filepath)
                        pcoll_materials.load(filepath, filepath, 'IMAGE')
    else:
        presets_folder = os.path.join(materials_library, material_preset_type)
        print(f"Loading materials presets from: {presets_folder}")  # Debug
        if os.path.exists(presets_folder):
            for fn in os.listdir(presets_folder):
                if fn.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tga")):
                    filepath = os.path.join(presets_folder, fn)
                    image_paths_materials.append(filepath)
                    pcoll_materials.load(filepath, filepath, 'IMAGE')

    items_materials = []
    for idx, filepath in enumerate(image_paths_materials):
        icon = pcoll_materials[filepath].icon_id
        image_name = os.path.splitext(os.path.basename(filepath))[0]
        items_materials.append((filepath, image_name, "", icon, idx))

    bpy.types.Scene.fluidkit_materials_lib_enum = EnumProperty(
        items=items_materials,
        description="Select an image for Fluid Kit Materials",
        name="",
    )

    if items_materials:
        scn.fluidkit_materials_lib_enum = items_materials[0][0]

    update_ui()


#Prop Group Class
class FluidKitPropGroup(bpy.types.PropertyGroup):
    # Dynamic get preset folder list for Assets/GN_Assets
    def get_preset_folders(self, context):
        folders = [("ALL", "All", "")]
        presets_library_base = get_presets_library_base(context)
        if os.path.exists(presets_library_base):
            for folder in os.listdir(presets_library_base):
                if os.path.isdir(os.path.join(presets_library_base, folder)):
                    folders.append((folder, folder, ""))
        return folders

    presets_type: bpy.props.EnumProperty(
        items=get_preset_folders,
        update=update_assets_previews,
        name="",
    ) #type: ignore

    # 新增獨立的 materials 庫子選單
    def get_material_preset_folders(self, context):
        folders = [("ALL", "All", "")]
        if os.path.exists(presets_library_base_Materials):
            for folder in os.listdir(presets_library_base_Materials):
                if os.path.isdir(os.path.join(presets_library_base_Materials, folder)):
                    folders.append((folder, folder, ""))
        return folders

    materials_presets_type: bpy.props.EnumProperty(
        items=get_material_preset_folders,
        update=update_materials_previews,
        name="Materials Library",
    ) #type: ignore

    # Assets Icon Size
    icon_view_size: bpy.props.FloatProperty(
        name="Assets Icon Size",
        default=10,
        min=1,
        max=25,
    ) #type: ignore

    # import location (toggle: 3d cursor(True) / world origin(False))
    import_location: bpy.props.BoolProperty(
        name="Import Location",
        default=False,
    ) #type: ignore

    # bool prop
    display_mtl_panel: bpy.props.BoolProperty(
        name="Display MTL Panel",
        default=True,
    ) #type: ignore

    # bool prop (Material library)
    display_material_library: bpy.props.BoolProperty(
        name="Display Material Library",
        default=True,
    ) #type: ignore

    # fluidkit version enum 改成 Assets 與 GN_Assets (上方選單不顯示 Materials)
    fluidkit_lib: bpy.props.EnumProperty(
        name="Fluid Kit Version",
        items=[("Assets", "Assets", ""), ("GN_Assets", "GN_Assets", "")],
        default="Assets",
        update=update_assets_previews_from_type,
    ) #type: ignore

    # ui size (float , default = 1.0)
    ui_size: bpy.props.FloatProperty(
        name="UI Size",
        default=1.0,
        step=0.1,
        min=0.1,
        max=3,
    ) #type: ignore

    #bool prop (Display All node in Shader Control Panel)
    display_all_node: bpy.props.BoolProperty(
        name="Display All Node",
        default=False,
    ) #type: ignore

    # 新增控制面板模式切換屬性 (GeometryNodes / Materials)
    control_panel_mode: bpy.props.EnumProperty(
        name="Control Panel Mode",
        items=[("MATERIALS", "Materials", "", "MATERIAL", 0),
               ("GEOMETRY", "Geometry Nodes", "", "GEOMETRY_NODES", 1)],
        default="GEOMETRY"
    )

    # 新增面數警告阈值設置
    # Add face count warning threshold setting
    face_count_warning_threshold: bpy.props.IntProperty(
        name="Face Count Warning Threshold",
        default=100000,
        min=10000,
        max=2500000,
        step=10000,
    ) #type: ignore

    #import asssets size (M)
    import_assets_size: bpy.props.FloatProperty(
        name="Import Assets Size",
        default=3,
        min=0.1,
        max=10,
        step=0.1,
    ) #type: ignore


# 新增：FluidKit 展開修改器屬性組（從 ForestAddon 移植並調整命名）
class FluidKit_ExpandedModifierProperties(bpy.types.PropertyGroup):
    name: bpy.props.StringProperty()   # type: ignore


# 新增：FluidKit 修改器展開切換 Operator（從 ForestAddon 移植並調整命名）
class FluidKit_ModifierToggleExpanded_OT(bpy.types.Operator):
    bl_idname = "fluid_kit.modifier_toggle_expanded"
    bl_label = "Fluid Kit Modifier Toggle Expanded"
    bl_options = {"REGISTER", "UNDO"}
    modifier_name: bpy.props.StringProperty(name="Modifier Name")
    def execute(self, context):
        expanded_modifiers = context.scene.expanded_modifiers
        for i, item in enumerate(expanded_modifiers):
            if item.name == self.modifier_name:
                expanded_modifiers.remove(i)
                return {"FINISHED"}
        new_item = expanded_modifiers.add()
        new_item.name = self.modifier_name
        return {"FINISHED"}


# reload library (僅針對上方 Assets/GN_Assets)
class FluidKit_Reload_Enum_Icon(bpy.types.Operator):
    bl_idname = "fluid_kit.reload_enum_icon"
    bl_label = "Fluid Kit Reload Enum Icon"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        update_assets_previews(None, bpy.context)
        update_materials_previews(None, bpy.context)
        return {"FINISHED"}


# GN lib

#import ops
class FluidKit_Import_Operator(bpy.types.Operator):
    bl_label = "Import Fluid Kit"
    bl_idname = "fluid_kit.import"
    bl_options = {"REGISTER", "UNDO"}
    #description
    bl_description = "Import Fluid Kit Assets"

    # 从setting.json中读取face_count_warning_threshold值
    # Read face_count_warning_threshold value from setting.json
    @staticmethod
    def get_face_count_warning_threshold():
        setting_path = os.path.join(current_path, "setting", "setting.json")
        try:
            with open(setting_path, 'r') as f:
                settings = json.load(f)
                return settings.get("face_count_warning_threshold", 100000)  # 默认值为100000
        except (FileNotFoundError, json.JSONDecodeError):
            return 100000  # 如果文件不存在或解析错误，返回默认值

    def invoke(self, context, event):
        # 取得選擇項目的名稱 (不包含副檔名)
        select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_assets_enum))[0]
        
        # 檢查面數是否超過閾值
        face_count, _ = get_assets_info(select_item)
        threshold = self.get_face_count_warning_threshold()
        
        if face_count and face_count > threshold:
            # 如果面數超過閾值，顯示確認對話框
            return context.window_manager.invoke_props_dialog(self, width=400)
        else:
            # 如果面數未超過閾值，直接執行
            return self.execute(context)
    
    def draw(self, context):
        layout = self.layout
        select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_assets_enum))[0]
        face_count, _ = get_assets_info(select_item)
        
        # 使用自適應文字換行函數顯示警告訊息
        # Use adaptive text wrap function to display warning message
        warning_text = f"The asset has {face_count} geometry faces. Are you sure you want to import?"
        adaptive_text_wrap(warning_text, layout, 40)
        layout.label(text="", icon="INFO")

    def execute(self, context):

        #if is GN_Assets

        if context.scene.fluid_kit_prop_group.fluidkit_lib == 'GN_Assets':
            # fluidkit_gn_assets_enum 
            # 取得選擇項目的名稱 (不包含副檔名)
            select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_gn_assets_enum))[0]
            # 獲取選擇項目所在的文件夾名稱，而不是項目名稱本身
            folder_name = os.path.dirname(context.scene.fluidkit_gn_assets_enum).split(os.path.sep)[-1]
            # 在 assets_library_path 中尋找與 folder_name 同名的 .blend 檔案
            blend_file_path = os.path.join(assets_library_path, f"{folder_name}.blend")
        elif context.scene.fluid_kit_prop_group.fluidkit_lib == 'Assets':
            # 取得選擇項目的名稱 (不包含副檔名)
            select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_assets_enum))[0]
            # 獲取選擇項目所在的文件夾名稱，而不是項目名稱本身
            folder_name = os.path.dirname(context.scene.fluidkit_assets_enum).split(os.path.sep)[-1]
            # 在 assets_library_path 中尋找與 folder_name 同名的 .blend 檔案
            blend_file_path = os.path.join(assets_library_path, f"{folder_name}.blend")

        #print data for debug
        print(f"blend_file_path: {blend_file_path}")
        print(f"select_item: {select_item}")
        print(f"folder_name: {folder_name}")
        print(f"assets_library_path: {assets_library_path}")

        # 檢查檔案是否存在
        if os.path.exists(blend_file_path):
            pass
        else:
            return {'CANCELLED'}
        
        #append object (name = select_item) to current scene and move to 3d cursor
        with bpy.data.libraries.load(blend_file_path, link=False) as (data_from, data_to):
            # 修正：obj 是字符串而不是对象，所以直接比較字符串
            data_to.objects = [obj for obj in data_from.objects if obj == select_item]
        
        # 確保有物件被導入後再進行後續操作
        if data_to.objects and len(data_to.objects) > 0:
            bpy.context.collection.objects.link(data_to.objects[0])
            bpy.context.view_layer.objects.active = data_to.objects[0]
            #get 3d cursor location
            cursor_location = bpy.context.scene.cursor.location
            #set object location to 3d cursor location
            data_to.objects[0].location = cursor_location
            
            # 获取物体的边界盒尺寸
            dimensions = data_to.objects[0].dimensions
            # 找出最大尺寸
            max_dimension = max(dimensions.x, dimensions.y, dimensions.z)
            # 获取用户设置的导入尺寸
            target_size = context.scene.fluid_kit_prop_group.import_assets_size
            # 计算等比缩放因子
            scale_factor = target_size / max_dimension
            # 应用等比缩放
            data_to.objects[0].scale.x *= scale_factor
            data_to.objects[0].scale.y *= scale_factor
            data_to.objects[0].scale.z *= scale_factor
            
            # 应用缩放到物体
            bpy.ops.object.select_all(action='DESELECT')
            data_to.objects[0].select_set(True)
            bpy.context.view_layer.objects.active = data_to.objects[0]
            bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        else:
            print(f"No object named '{select_item}' found in the library")

        return {'FINISHED'}

    
#if material slot is empty, add material , if not empty , popup ui double click , if user cancel , do nothing , if user confirm , clear material slot then add material

#import materials
class FluidKit_Import_Materials_Operator(bpy.types.Operator):
    bl_label = "Import Materials"
    bl_idname = "fluid_kit.import_materials"
    #undo 
    bl_options = {"REGISTER", "UNDO"}
    def invoke(self, context, event):
        # 取得選取的物件 (僅限 mesh 和 curve)
        selected_objects = [obj for obj in context.selected_objects if obj.type in ['MESH', 'CURVE']]
        # 檢查是否有物件的 material slot 不為空
        need_confirm = False
        for obj in selected_objects:
            if obj.data.materials:
                for m in obj.data.materials:
                    if m is not None:
                        need_confirm = True
                        break
                if need_confirm:
                    break
        if need_confirm:
            # 若需要確認，則呼叫對話框 (按下取消則不執行)
            return context.window_manager.invoke_props_dialog(self, width=400)
        else:
            # 若所有物件的 material slot 均為空，直接執行
            return self.execute(context)

    def draw(self, context):
        layout = self.layout
        layout.label(text="Do you want to replace the existing material with the new material?",icon="ERROR")

    def execute(self, context):
        # 取得選取的物件 (僅限 mesh 和 curve)
        selected_objects = [obj for obj in context.selected_objects if obj.type in ['MESH', 'CURVE']]
        # 取得選取的材質名稱 (來自 fluidkit_materials_lib_enum)
        select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_materials_lib_enum))[0]
        if Dev_Mode:
            print("Import Materials")
            print(select_item)

        # 從 materials_library_path 中查找並導入選定的材質
        def import_material(select_item):
            with bpy.data.libraries.load(materials_library_path, link=False) as (data_from, data_to):
                if select_item in data_from.materials:
                    data_to.materials = [select_item]
                    if Dev_Mode:
                        print(f"Material '{select_item}' found in library and loaded")
                else:
                    if Dev_Mode:
                        print(f"Material '{select_item}' not found in library")
            return data_to.materials[0] if data_to.materials else None

        mat = bpy.data.materials.get(select_item)
        if mat is None:
            imported_mat = import_material(select_item)
            if imported_mat:
                mat = imported_mat
            else:
                self.report({'ERROR'}, f"Material '{select_item}' not found in library")
                if Dev_Mode:
                    print(f"Failed to import material '{select_item}'")
                return {'CANCELLED'}
        for obj in selected_objects:
            if obj.data.materials:
                if any(m is not None for m in obj.data.materials):
                    while obj.data.materials:
                        obj.data.materials.pop(index=0)
                    obj.data.materials.append(mat)
                else:
                    if len(obj.data.materials) > 0:
                        obj.data.materials[0] = mat
                    else:
                        obj.data.materials.append(mat)
            else:
                obj.data.materials.append(mat)

        # 查找以"FluidKit_"开头的Geometry Nodes修改器并分配材质
        for obj in selected_objects:
            for modifier in obj.modifiers:
                if modifier.type == 'NODES' and modifier.name.startswith("FluidKit_"):
                    if bpy.app.version >= (4, 0, 0):
                        material_assigned = False
                        if modifier.node_group:
                            for item in modifier.node_group.interface.items_tree:
                                if (item.item_type == 'SOCKET' and 
                                    item.in_out == 'INPUT' and 
                                    item.socket_type == 'NodeSocketMaterial'):
                                    prop_name = item.identifier
                                    if prop_name in modifier:
                                        modifier[prop_name] = mat
                                        material_assigned = True
                                        if Dev_Mode:
                                            print(f"Assigned material '{mat.name}' to {modifier.name} {prop_name} socket (4.0+)")
                                        break
                        if not material_assigned:
                            if "Material" in modifier:
                                modifier["Material"] = mat
                                if Dev_Mode:
                                    print(f"Assigned material '{mat.name}' to {modifier.name} Material socket (4.0+)")
                            elif "Socket_0" in modifier:
                                modifier["Socket_0"] = mat
                                if Dev_Mode:
                                    print(f"Assigned material '{mat.name}' to {modifier.name} Socket_0 (4.0+)")
                    else:
                        material_assigned = False
                        if modifier.node_group:
                            group_input_node = next((node for node in modifier.node_group.nodes if node.type == 'GROUP_INPUT'), None)
                            if group_input_node:
                                for output in group_input_node.outputs:
                                    if hasattr(output, 'bl_idname') and output.bl_idname == 'NodeSocketMaterial':
                                        prop_name = output.identifier
                                        if prop_name in modifier:
                                            modifier[prop_name] = mat
                                            material_assigned = True
                                            if Dev_Mode:
                                                print(f"Assigned material '{mat.name}' to {modifier.name} {prop_name} socket (3.x)")
                                            break
                        if not material_assigned:
                            for input_name, input_value in modifier.items():
                                if hasattr(input_value, 'socket_type') and input_value.socket_type == 'NodeSocketMaterial':
                                    modifier[input_name] = mat
                                    material_assigned = True
                                    if Dev_Mode:
                                        print(f"Assigned material '{mat.name}' to {modifier.name} {input_name} socket (3.x)")
                                    break
                            if not material_assigned:
                                if "Material" in modifier:
                                    modifier["Material"] = mat
                                    if Dev_Mode:
                                        print(f"Assigned material '{mat.name}' to {modifier.name} Material socket (3.x)")
                                elif "Socket_0" in modifier:
                                    modifier["Socket_0"] = mat
                                    if Dev_Mode:
                                        print(f"Assigned material '{mat.name}' to {modifier.name} Socket_0 (3.x)")

        return {'FINISHED'}


class FluidKit_PanelSettings_Operator(bpy.types.Operator):
    bl_idname = "fluid_kit.panel_settings"
    bl_label = "Fluid Kit Settings"
    bl_options = {"REGISTER", "UNDO"}

    #str 
    ops_type : bpy.props.StringProperty(
        name="Ops Type",
        default="",
    ) #type: ignore

    def execute(self, context):
        print(f"execute: {self.ops_type}")
        if self.ops_type == "save":
            print("save")
            # Get settings file path
            setting_file_path = os.path.join(current_path, "setting", "setting.json")
            # Ensure directory exists
            os.makedirs(os.path.dirname(setting_file_path), exist_ok=True)
            
            # Create new settings data
            settings = {
                "icon_view_size": context.scene.fluid_kit_prop_group.icon_view_size
            }
            
            # Write settings to file
            with open(setting_file_path, "w") as f:
                json.dump(settings, f, ensure_ascii=False, indent=4)

            #ui size
            settings["ui_size"] = context.scene.fluid_kit_prop_group.ui_size

            # Write settings to file
            with open(setting_file_path, "w") as f:
                json.dump(settings, f, ensure_ascii=False, indent=4)

###################################################################
###################################################################
            #display all node
            settings["display_all_node"] = context.scene.fluid_kit_prop_group.display_all_node

            # Write settings to file
            with open(setting_file_path, "w") as f:
                json.dump(settings, f, ensure_ascii=False, indent=4)
###################################################################
###################################################################
            #face count warning threshold
            settings["face_count_warning_threshold"] = context.scene.fluid_kit_prop_group.face_count_warning_threshold

            # Write settings to file
            with open(setting_file_path, "w") as f:
                json.dump(settings, f, ensure_ascii=False, indent=4)


            self.report({'INFO'}, f"Settings Saved")
        elif self.ops_type == "reset":
            ui_size_default_value = FluidKitPropGroup.bl_rna.properties['ui_size'].default
            icon_view_size_default_value = FluidKitPropGroup.bl_rna.properties['icon_view_size'].default
            display_all_node_default_value = FluidKitPropGroup.bl_rna.properties['display_all_node'].default
            face_count_warning_threshold_default_value = FluidKitPropGroup.bl_rna.properties['face_count_warning_threshold'].default

            bpy.context.scene.fluid_kit_prop_group.ui_size = ui_size_default_value
            bpy.context.scene.fluid_kit_prop_group.icon_view_size = icon_view_size_default_value
            bpy.context.scene.fluid_kit_prop_group.display_all_node = display_all_node_default_value
            bpy.context.scene.fluid_kit_prop_group.face_count_warning_threshold = face_count_warning_threshold_default_value
            update_ui()
            self.report({'INFO'}, f"Settings Reset")
        return {"FINISHED"}

    def invoke(self, context, event):
        if self.ops_type == "reset":
            return context.window_manager.invoke_props_dialog(self)
        elif self.ops_type == "save":
            return context.window_manager.invoke_props_dialog(self)
        return {"FINISHED"}

    def draw(self, context):
        if self.ops_type == "reset":
            layout = self.layout
            layout.label(text="Reset all settings to default value?")
        elif self.ops_type == "save":
            layout = self.layout
            layout.label(text="Save current settings?")


# UI

class FluidKit_InfoPanel_Popover(bpy.types.Panel):
    bl_idname = "FLUID_KIT_PT_info_popover_unique"
    bl_label = "Fluid Kit Info Popover"
    bl_space_type = 'VIEW_3D'      
    bl_region_type = 'WINDOW'      
    bl_options = {'HIDE_HEADER'}

    def draw(self, context):
        layout = self.layout
        layout.label(text="Info",icon="INFO")
        box = layout.box()

        emboss_state = False
        #documentation
        box.operator('wm.url_open', text='Documentation', icon="HELP", emboss=emboss_state, depress=False).url = 'https://blendermarket.com/products/fluid-kit/docs?ref=1211'
        #discord
        box.operator('wm.url_open', text='Discord', icon_value=fluid_kit_ui_icons['Discord_icon'].icon_id, emboss=emboss_state, depress=False).url = 'https://discord.gg/regrPaE5ur'
        #get more addon
        box.operator('wm.url_open', text='More Addon', icon_value=fluid_kit_ui_icons['My_icon'].icon_id, emboss=emboss_state, depress=False).url = 'https://blendermarket.com/creators/caseysheep?ref=1211'

class FluidKit_Description_Popover(bpy.types.Panel):
    bl_idname = "FLUID_KIT_PT_description_popover_unique"
    bl_label = "Fluid Kit Description Popover"
    bl_space_type = 'VIEW_3D'      
    bl_region_type = 'WINDOW'      
    bl_options = {'HIDE_HEADER'}

    display_description_text = "None"

    def draw(self, context):
        layout = self.layout
        layout.label(text="Info",icon="INFO")
        box = layout.box()
        if Auto_Adaptive_Text:
            adaptive_text_wrap(self.display_description_text, box, 28)
        else:
            box.label(text=self.display_description_text)

class FluidKit_PanelSettings_Popover(bpy.types.Panel):
    bl_idname = "FLUID_KIT_PT_panel_settings_popover_unique"
    bl_label = "Fluid Kit Panel Settings Popover"
    bl_space_type = 'VIEW_3D'      
    bl_region_type = 'WINDOW'      
    bl_options = {'HIDE_HEADER'}   

    def draw(self, context):
        layout = self.layout
        row = layout.row()
        row.label(text="Settings",icon="PREFERENCES")
        op_reset = row.operator("fluid_kit.panel_settings", text="Reset", icon="RECOVER_LAST")
        op_reset.ops_type = "reset"
        layout.prop(context.scene.fluid_kit_prop_group, "icon_view_size")
        layout.prop(context.scene.fluid_kit_prop_group, "ui_size",text="UI Size")
        layout.separator()
        row = layout.row()
        row.prop(context.scene.fluid_kit_prop_group, "display_all_node",text="Display All Node")
        FluidKit_Description_Popover.display_description_text = "This feature does not display all types of nodes. Unless you have a specific need, it's not recommended to enable it."
        row.popover(
            panel=FluidKit_Description_Popover.bl_idname,
            text="",
            icon="QUESTION",
        )
        layout.separator()
        row = layout.row()
        row.label(text="Face Count Warning Threshold",icon="ERROR")
        row = layout.row()
        row.prop(context.scene.fluid_kit_prop_group, "face_count_warning_threshold", text="")
        FluidKit_Description_Popover.display_description_text = "When the imported asset exceeds this threshold, a warning will be displayed."
        row.popover(
            panel=FluidKit_Description_Popover.bl_idname,
            text="",
            icon="QUESTION",
        )
        layout.separator()
        op1 = layout.operator("fluid_kit.panel_settings", text="Save Preferences", icon="CHECKMARK")
        op1.ops_type = "save"

class FluidKit_Panel_BackObjectMode_Operator(bpy.types.Operator):
    bl_idname = "fluid_kit.panel_back_object_mode"
    bl_label = "Fluid Kit Panel Back Object Mode"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        if context.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
        return {'FINISHED'}


# 新增：Geometry Nodes 控制面板，顯示所有名稱以 "FluidKit_" 開頭的 GN 修改器
def GeometryNodes_Control_Panel(self, context, layout):
    """
    顯示 active 物件上所有名稱以 "FluidKit_" 開頭的 Geometry Nodes Modifier 控制介面。
    採用 toggle list 模式，並根據 Blender 版本分支優化展開內容。
    """
    obj = context.active_object
    if not obj:
        layout.label(text="No active object", icon="ERROR")
        return
    if not obj.modifiers:
        layout.label(text="No modifiers found", icon="INFO")
        return

    if bpy.app.version >= (4, 0, 0):
        for mod in obj.modifiers:
            if mod.type == 'NODES' and mod.name.startswith("FluidKit_"):
                box = layout.box()
                row = box.row()
                is_expanded = any(item.name == mod.name for item in context.scene.expanded_modifiers)
                icon = 'TRIA_DOWN' if is_expanded else 'TRIA_RIGHT'
                op = row.operator("fluid_kit.modifier_toggle_expanded", text=mod.name, icon=icon, emboss=False)
                op.modifier_name = mod.name
                if is_expanded and mod.node_group:
                    current_category = None
                    category_expanded = False
                    for item in mod.node_group.interface.items_tree:
                        if item.item_type == 'SOCKET' and item.in_out == 'INPUT':
                            prop_name = item.identifier
                            if prop_name in mod:
                                socket_type = item.socket_type
                                if socket_type == 'NodeSocketString' and item.hide_value:
                                    cat_name = f"{mod.name}_{prop_name}"
                                    is_cat_expanded = any(cat.name == cat_name for cat in context.scene.expanded_modifiers)
                                    icon_cat = 'TRIA_DOWN' if is_cat_expanded else 'TRIA_RIGHT'
                                    cat_box = box.box()
                                    row_cat = cat_box.row()
                                    display_text = f"{item.name} {mod[prop_name]}"
                                    op_cat = row_cat.operator("fluid_kit.modifier_toggle_expanded", text=display_text, icon=icon_cat, emboss=False)
                                    op_cat.modifier_name = cat_name
                                    current_category = cat_box
                                    category_expanded = is_cat_expanded
                                elif current_category and category_expanded:
                                    if socket_type == 'NodeSocketInt':
                                        row_prop = current_category.row(align=True)
                                        row_prop.prop(mod, f'["{prop_name}"]', text=item.name)
                                    elif socket_type == 'NodeSocketFloat':
                                        row_prop = current_category.row(align=True)
                                        row_prop.prop(mod, f'["{prop_name}"]', text=item.name)
                                    elif socket_type == 'NodeSocketBool':
                                        row_prop = current_category.row()
                                        row_prop.prop(mod, f'["{prop_name}"]', text=item.name, icon="CHECKBOX_HLT")
                                    elif socket_type == 'NodeSocketMaterial':
                                        row_prop = current_category.row()
                                        row_prop.prop_search(mod, f'["{prop_name}"]', bpy.data, "materials", text=item.name, icon="MATERIAL")
                                    elif socket_type == 'NodeSocketCollection':
                                        row_prop = current_category.row()
                                        row_prop.prop_search(mod, f'["{prop_name}"]', bpy.data, "collections", text=item.name, icon="OUTLINER_COLLECTION")
                                    elif socket_type == 'NodeSocketString':
                                        row_prop = current_category.row()
                                        row_prop.prop(mod, f'["{prop_name}"]', text=item.name)
                                    elif socket_type == 'NodeSocketVector':
                                        row_prop = current_category.row(align=True)
                                        row_prop.prop(mod, f'["{prop_name}"]', text=item.name)
    else:
        # Blender 4.0 以下版本處理（利用 GROUP_INPUT 節點），移植自 ForestAddon 的實現
        for mod in obj.modifiers:
            if mod.type == 'NODES' and mod.name.startswith("FluidKit_") and mod.node_group:
                box = layout.box()
                row = box.row()
                is_expanded = any(item.name == mod.name for item in context.scene.expanded_modifiers)
                icon = 'TRIA_DOWN' if is_expanded else 'TRIA_RIGHT'
                op = row.operator("fluid_kit.modifier_toggle_expanded", text=mod.name, icon=icon, emboss=False)
                op.modifier_name = mod.name
                if is_expanded:
                    # 使用集合來跟踪已處理的屬性
                    processed_props = set()
                    current_category = None
                    category_expanded = False
                    # 只遍歷 GROUP_INPUT 節點（同時允許 ShaderNodeMaterial，但排除名稱以 "Fog_" 開頭的）
                    nodes_to_check = [node for node in mod.node_group.nodes if node.type in {'GROUP_INPUT', 'ShaderNodeMaterial'} and not node.name.startswith("Fog_")]
                    group_input_node = next((node for node in nodes_to_check if node.type == 'GROUP_INPUT'), None)
                    if group_input_node:
                        for input_socket in group_input_node.outputs:
                            if hasattr(input_socket, 'bl_idname') and input_socket.bl_idname.startswith('NodeSocket'):
                                prop_name = input_socket.identifier
                                if prop_name in mod and prop_name not in processed_props:
                                    socket_type = input_socket.bl_idname
                                    # 檢查有勾選 hide_value 的字符串類型，作為新類別的開始
                                    if socket_type == 'NodeSocketString' and input_socket.hide_value:
                                        # 創建新的類別框
                                        category_box = box.box()
                                        row_cat = category_box.row()
                                        # 使用字符串值作為類別名稱
                                        category_name = f"{mod.name}_{prop_name}"
                                        is_cat_expanded = any(item.name == category_name for item in context.scene.expanded_modifiers)
                                        icon_cat = 'TRIA_DOWN' if is_cat_expanded else 'TRIA_RIGHT'
                                        # 獲取當前字符串屬性的值
                                        string_value = mod[prop_name]
                                        display_text = f"{input_socket.name} {string_value}"
                                        op_cat = row_cat.operator("fluid_kit.modifier_toggle_expanded", text=display_text, icon=icon_cat, emboss=False)
                                        op_cat.modifier_name = category_name
                                        current_category = category_box
                                        category_expanded = is_cat_expanded
                                    elif current_category and category_expanded:
                                        # 包裹非字符串屬性到當前類別框
                                        if socket_type not in ('NodeSocketMaterial', 'NodeSocketCollection', 'NodeSocketString', 'NodeSocketObject'):
                                            row_prop = current_category.row(align=True)
                                            row_prop.prop(mod, f'["{prop_name}"]', text=input_socket.name)
                                        if socket_type == 'NodeSocketMaterial':
                                            row_prop = current_category.row()
                                            row_prop.prop_search(mod, f'["{prop_name}"]', bpy.data, "materials", text=input_socket.name)
                                        if socket_type == 'NodeSocketCollection':
                                            row_prop = current_category.row()
                                            row_prop.prop_search(mod, f'["{prop_name}"]', bpy.data, "collections", text=input_socket.name)
                                        if socket_type == 'NodeSocketString':
                                            row_prop = current_category.row()
                                            row_prop.prop(mod, f'["{prop_name}"]', text=input_socket.name)
                                        if socket_type == 'NodeSocketObject':
                                            row_prop = current_category.row()
                                            row_prop.prop_search(mod, f'["{prop_name}"]', bpy.data, "objects", text=input_socket.name)
                                        processed_props.add(prop_name)


# 以下是主面板，這裡在 #這邊進行修改 處新增了切換面板功能
class FluidKit_PT_Main_Panel(bpy.types.Panel):
    bl_label = "Fluid Kit"
    bl_idname = "FLUID_KIT_PT_main_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Fluid Kit'

    def draw_header(self, context: bpy.types.Context):
        layout = self.layout
        layout.label(text="", icon_value=fluid_kit_ui_icons['Fluid_Kit_Icon_x256'].icon_id)

    def draw_header_preset(self, context):
        layout = self.layout

        row = layout.row(heading='', align=False)
        row.alert = False
        row.enabled = True
        row.active = True
        row.use_property_split = False
        row.use_property_decorate = False
        row.alignment = 'RIGHT'

        # reload enum icon (上方)
        row.operator("fluid_kit.reload_enum_icon", icon="FILE_REFRESH", text="")

        box = row.box()
        box_row = box.row()
        box_row.popover(
            panel=FluidKit_InfoPanel_Popover.bl_idname,
            text="",
            icon="HELP",
        )

        box_row.popover(
            panel=FluidKit_PanelSettings_Popover.bl_idname,
            text="",
            icon="TOOL_SETTINGS"
        )

    def draw(self, context):
        layout = self.layout
        
        ui_size = context.scene.fluid_kit_prop_group.ui_size
        layout.scale_y = ui_size

        layout.active = True

        if context.mode != 'OBJECT':
            box_error = layout.box()
            box_error.scale_y = ui_size * 2
            box_error.label(text="Please switch to Object mode", icon="ERROR")
            box_error.operator("fluid_kit.panel_back_object_mode", text="Back to Object mode", icon="LOOP_BACK")
            return None
                
        box = layout.box()

        lib_icon = 'ASSET_MANAGER'
        if context.scene.fluid_kit_prop_group.fluidkit_lib == "GN_Assets":
            lib_icon = 'GEOMETRY_NODES'
        else:
            lib_icon = 'ASSET_MANAGER'

        box.prop(context.scene.fluid_kit_prop_group, "fluidkit_lib", text="Type", icon=lib_icon)
        box.prop(context.scene.fluid_kit_prop_group, "presets_type", text="Assets", icon='OUTLINER_COLLECTION')

        if context.scene.fluid_kit_prop_group.fluidkit_lib == "Assets":
            box.template_icon_view(context.scene, "fluidkit_assets_enum", 
                                   show_labels=False, 
                                   scale=context.scene.fluid_kit_prop_group.icon_view_size, 
                                   scale_popup=context.scene.fluid_kit_prop_group.icon_view_size*0.7)
        else:
            box.template_icon_view(context.scene, "fluidkit_gn_assets_enum", 
                                   show_labels=False, 
                                   scale=context.scene.fluid_kit_prop_group.icon_view_size, 
                                   scale_popup=context.scene.fluid_kit_prop_group.icon_view_size*0.7)

        box_row = box.row()
        box_row.prop(context.scene.fluid_kit_prop_group, "import_assets_size", text="Import Size (M)", icon="CON_SIZELIKE")
        box_row = box.row()
        box_row.operator("fluid_kit.import", text="Import", icon='ADD')

        select_item = os.path.splitext(os.path.basename(context.scene.fluidkit_assets_enum))[0]
        face_count, id = get_assets_info(select_item)
        if face_count and id:
            box_row = box.row()
            box_row.label(text=f"Assets Info", icon="INFO")
            box_row = box.row()
            box_row.label(text=f"Name: {select_item}")
            box_row.label(text=f"Face Count: {face_count}")

        layout.separator()

        selected_objects = context.selected_objects
        box_mtl_gn_control = layout.box()

        row = box_mtl_gn_control.row(align=True)
        row.prop(context.scene.fluid_kit_prop_group, "control_panel_mode", expand=True)

        if context.scene.fluid_kit_prop_group.control_panel_mode == "GEOMETRY":
            box_mtl_gn_control.label(text="Geometry Nodes Control", icon="GEOMETRY_NODES")
            GeometryNodes_Control_Panel(self, context, box_mtl_gn_control)
        elif context.scene.fluid_kit_prop_group.control_panel_mode == "MATERIALS":
            box_mtl_gn_control.active = len(selected_objects) > 0
            box_mtl_gn_control.label(text="Materials Library", icon="MATERIAL")
            if selected_objects:
                box_mtlib = box_mtl_gn_control.box()
                box_mtlib.prop(context.scene.fluid_kit_prop_group, "display_material_library", icon='DISCLOSURE_TRI_DOWN' if context.scene.fluid_kit_prop_group.display_material_library else 'DISCLOSURE_TRI_RIGHT', text="Material Settings", emboss=False)
                box_mtlib.active = context.scene.fluid_kit_prop_group.display_material_library
                if context.scene.fluid_kit_prop_group.display_material_library:
                    box_mtlib.prop(context.scene.fluid_kit_prop_group, "materials_presets_type", text="", icon='MATERIAL')
                    box_mtlib.template_icon_view(context.scene, "fluidkit_materials_lib_enum", 
                                        show_labels=False, 
                                        scale=context.scene.fluid_kit_prop_group.icon_view_size, 
                                        scale_popup=context.scene.fluid_kit_prop_group.icon_view_size*0.7)
                    box_mtlib.operator("fluid_kit.import_materials", text="Add Material", icon='ADD')
                # 呼叫 Shader 控制面板
                def Shaders_Control_Panel(self, context, layout):
                    ui_size = context.scene.fluid_kit_prop_group.ui_size
                    layout.scale_y = ui_size 
                    name_start_with_default = "FluidKit_"
                    if context.scene.fluid_kit_prop_group.display_all_node:
                        name_start_with = ""
                    else:
                        name_start_with = name_start_with_default
                    obj = bpy.context.active_object
                    layout = layout.box()
                    layout.active = context.scene.fluid_kit_prop_group.display_mtl_panel
                    layout.prop(context.scene.fluid_kit_prop_group, "display_mtl_panel", icon='DISCLOSURE_TRI_DOWN' if context.scene.fluid_kit_prop_group.display_mtl_panel else 'DISCLOSURE_TRI_RIGHT', text="Material Settings", emboss=False)
                    if context.scene.fluid_kit_prop_group.display_mtl_panel:
                        if obj and obj.type in ['MESH', 'CURVE'] and obj.material_slots:
                            for slot in obj.material_slots:
                                if slot.material and slot.material.node_tree:
                                    nodes = [n for n in slot.material.node_tree.nodes if n.name.startswith(name_start_with)]
                                    if nodes:
                                        box = layout.box()
                                        box.label(text="Shader Control", icon="SHADERFX")
                                        for node in nodes:
                                            box = layout.box()
                                            nodes_label = node.label
                                            if not nodes_label:
                                                nodes_label = node.name
                                            layer_icon = "NODE"
                                            box.label(text=nodes_label, icon=layer_icon)
                                            if node.type == "GROUP":
                                                if node.node_tree and node.node_tree.nodes:
                                                    for sub_node in node.node_tree.nodes:
                                                        if sub_node.name.startswith("#"):
                                                            if sub_node.label.endswith("Texture"):
                                                                layer_icon = "TEXTURE"
                                                            elif sub_node.label.endswith("Transform"):
                                                                layer_icon = "TRANSFORM_ORIGINS" 
                                                            elif sub_node.label.endswith("Mask"):
                                                                layer_icon = "MOD_MASK"
                                                            else:
                                                                layer_icon = "NODE"
                                                            box.label(text=sub_node.label, icon=layer_icon)
                                                            box.context_pointer_set("node", sub_node)
                                                            if hasattr(sub_node, "draw_buttons_ext"):
                                                                sub_node.draw_buttons_ext(context, box)
                                                            elif hasattr(sub_node, "draw_buttons"):
                                                                sub_node.draw_buttons(context, box)
                                                            value_inputs = [socket for socket in sub_node.inputs if not socket.hide_value and not socket.is_linked]
                                                            if value_inputs:
                                                                box.separator()
                                                                for socket in value_inputs:
                                                                    row = box.row()
                                                                    row.scale_x = 1
                                                                    row.scale_y = 1.2
                                                                    socket.draw(context, row, sub_node, socket.name)
                                            for input in node.inputs:
                                                if not input.hide_value and hasattr(input, "default_value"):
                                                    row = box.row()
                                                    row.prop(input, "default_value", text=input.name)
                                                elif input.type == 'SHADER' and node.type == 'GROUP':
                                                    box = layout.box()
                                                    set_icon = "COLLAPSEMENU"
                                                    if input.name == "Color":
                                                        set_icon = "COLOR"
                                                    elif input.name == "Mapping":
                                                        set_icon = "ORIENTATION_LOCAL"
                                                    elif input.name == "Sediment":
                                                        set_icon = "FILE_VOLUME"
                                                    row = box.row()
                                                    row.label(text=input.name, icon=set_icon)
                        else:
                            layout.label(text="Shader not found", icon="QUESTION")
                Shaders_Control_Panel(self, context, box_mtl_gn_control)
            else:
                box_mtl_gn_control.label(text="Please select object", icon="ERROR")


classes = (
    FluidKitPropGroup,
    FluidKit_ExpandedModifierProperties,
    FluidKit_ModifierToggleExpanded_OT,
    FluidKit_Reload_Enum_Icon,
    FluidKit_Import_Operator,
    FluidKit_Import_Materials_Operator,
    FluidKit_PanelSettings_Operator,
    FluidKit_InfoPanel_Popover,
    FluidKit_PanelSettings_Popover,
    FluidKit_Panel_BackObjectMode_Operator,
    FluidKit_Description_Popover,
    FluidKit_PT_Main_Panel,
)

def register():
    def delayed_register():
        for cls in classes:
            bpy.utils.register_class(cls)

        bpy.types.Scene.fluid_kit_prop_group = bpy.props.PointerProperty(type=FluidKitPropGroup)
        preview_collections["my_previews"] = bpy.utils.previews.new()

        pcoll = bpy.utils.previews.new()
        preview_collections["my_previews"] = pcoll

        # 新增：註冊 FluidKit 展開修改器集合屬性
        bpy.types.Scene.expanded_modifiers = bpy.props.CollectionProperty(type=FluidKit_ExpandedModifierProperties)

        update_assets_previews(None, bpy.context)
        update_materials_previews(None, bpy.context)

    bpy.app.timers.register(delayed_register, first_interval=0.1)
    print("Fluid Kit registered")

def unregister():
    for cls in classes:
        bpy.utils.unregister_class(cls)

    del bpy.types.Scene.fluid_kit_prop_group
    preview_collections["my_previews"].clear()

    for pcoll in preview_collections.values():
        bpy.utils.previews.remove(pcoll)
    preview_collections.clear()

    if hasattr(bpy.types.Scene, "expanded_modifiers"):
        del bpy.types.Scene.expanded_modifiers

    print("Fluid Kit unregistered")

if __name__ == "__main__":
    register()
