# 🎯 PROJECT FOLDERS & AUTO-GROUPING GUIDE

## ✅ **NEW FEATURES IMPLEMENTED:**

### **1. 🎵 AUTO-CREATE PROJECT FOLDERS FROM .PTX / .FLP FILES**

**How It Works:**
When you upload project files (.ptx, .flp, .als, etc.), the system automatically creates a **PROJECT FOLDER** (purple color) to organize all related files.

**Supported Project Files:**
- `.ptx` - Pro Tools sessions
- `.flp` - FL Studio projects
- `.als` - Ableton Live sets
- `.logic` - Logic Pro projects
- `.rpp` - REAPER projects
- `.cpr` - Cubase projects
- `.aup` - Audacity projects
- `.band` - GarageBand projects

**Example:**
```
Upload:
- keep dreamin.bak.003.ptx
- keep dreamin vocal.wav
- keep dreamin beat.mp3

Result:
✅ Auto-creates PROJECT FOLDER: "keep dreamin" (purple)
✅ All 3 files grouped together
✅ Click folder → See all files
✅ .ptx file is NOT playable (as expected)
✅ Audio files ARE playable
```

---

### **2. 🎨 AUTO-GROUP SIMILAR FILES**

**Smart Grouping:**
Files with similar names are automatically grouped into folders!

**Patterns Detected:**
- Version numbers: `Beat_v1.wav`, `Beat_v2.wav` → "Beat"
- Backups: `track.bak.001.ptx`, `track.bak.002.ptx` → "track"
- Copies: `Loop (1).mp3`, `Loop (2).mp3` → "Loop"
- Numbered: `Song-1.wav`, `Song-2.wav` → "Song"
- Suffixes: `Mix_final.wav`, `Mix_master.wav` → "Mix"

**Example:**
```
Upload:
- Trap Beat v1.mp3
- Trap Beat v2.mp3
- Trap Beat_final.mp3

Result:
✅ Auto-creates FOLDER: "Trap Beat" (cyan)
✅ All 3 versions grouped
✅ Easy version management
```

---

### **3. 🎵 AUTO-CREATE PROJECT FROM STEM SEPARATION**

**Automatic Project Creation:**
When you use stem separation, a **PROJECT FOLDER** is automatically created with all stems!

**How It Works:**
```
1. Upload: "My Song.mp3"
2. Click file → STEM_SEPARATION tab
3. Click "SEPARATE_STEMS"
4. Wait 2-5 minutes
5. ✅ Auto-creates PROJECT: "My Song - Stems" (purple)
6. ✅ Contains:
   - Original: My Song.mp3
   - Vocals stem
   - Drums stem
   - Bass stem
   - Other stem (instruments)
```

**Benefits:**
- All stems organized in one place
- Easy to find and manage
- Can add more files to the project
- Perfect for remixing/collaboration

---

### **4. 📁 FOLDER COLOR SYSTEM**

**Color Meanings:**
- 🟣 **Purple (#9d4edd)** - PROJECT FOLDERS (from .ptx, .flp, or stem separation)
- 🔵 **Cyan (#00ffff)** - AUTO-GROUPED (similar file names)
- 🟢 **Green (#00ff41)** - MANUALLY CREATED
- 🟣 **Magenta (#ff00ff)** - DROPPED FROM FINDER/WINDOWS

**Visual Organization:**
- Instantly see project vs regular folders
- Color-coded for quick navigation
- Easy to identify folder source

---

### **5. 🎯 PLAYABILITY RULES**

**Playable Files:**
- ✅ `.mp3` - Playable
- ✅ `.wav` - Playable
- ✅ `.m4a` - Playable
- ✅ `.flac` - Playable
- ✅ `.aiff` - Playable
- ✅ `.ogg` - Playable

**Non-Playable (Project Files):**
- ❌ `.ptx` - NOT playable (Pro Tools session)
- ❌ `.flp` - NOT playable (FL Studio project)
- ❌ `.als` - NOT playable (Ableton set)
- ❌ `.logic` - NOT playable (Logic project)

**Why?**
- Project files are DAW sessions, not audio
- They contain project data, automation, plugins, etc.
- Audio files within the project ARE playable
- System correctly identifies and handles each type

---

## 🎯 **COMPLETE WORKFLOWS:**

### **Workflow 1: Upload Pro Tools Session**

```
1. PREPARE FILES
   - keep dreamin.bak.003.ptx (Pro Tools session)
   - keep dreamin vocal.wav (vocal track)
   - keep dreamin beat.mp3 (beat)
   - keep dreamin bass.wav (bass)

2. UPLOAD
   - Drag all 4 files to vault
   - OR drag entire folder from Finder

3. AUTO-ORGANIZATION
   ✅ System detects .ptx file
   ✅ Creates PROJECT: "keep dreamin" (purple)
   ✅ Groups all 4 files together
   ✅ .ptx = NOT playable
   ✅ .wav/.mp3 = Playable

4. MANAGE PROJECT
   - Click purple folder in sidebar
   - See all 4 files
   - Play audio files
   - Add more files by dragging to folder
   - Add collaborators
   - Set splits
```

---

### **Workflow 2: Stem Separation → Auto-Project**

```
1. UPLOAD TRACK
   - Upload "Trap Banger.mp3"
   - Status: IDEA

2. SEPARATE STEMS
   - Click file
   - STEM_SEPARATION tab
   - Click "SEPARATE_STEMS"
   - Wait 2-5 minutes

3. AUTO-PROJECT CREATED
   ✅ PROJECT: "Trap Banger - Stems" (purple)
   ✅ Contains:
      - Trap Banger.mp3 (original)
      - Trap Banger_vocals.wav
      - Trap Banger_drums.wav
      - Trap Banger_bass.wav
      - Trap Banger_other.wav

4. USE STEMS
   - Click purple folder
   - Play each stem individually
   - Download stems for remixing
   - Share with collaborators
   - Add more versions/remixes to folder
```

---

### **Workflow 3: Multiple Versions → Auto-Group**

```
1. UPLOAD VERSIONS
   - Beat v1.mp3
   - Beat v2.mp3
   - Beat v3_final.mp3

2. AUTO-GROUPING
   ✅ System detects similar names
   ✅ Creates FOLDER: "Beat" (cyan)
   ✅ All 3 versions grouped

3. VERSION MANAGEMENT
   - Click cyan folder
   - See all versions
   - Compare versions
   - Mark best version as FOR_SALE
   - Archive old versions
```

---

### **Workflow 4: FL Studio Project + Stems**

```
1. UPLOAD PROJECT
   - My Track.flp (FL Studio project)
   - My Track.mp3 (bounced audio)

2. AUTO-PROJECT
   ✅ PROJECT: "My Track" (purple)
   ✅ Both files grouped

3. ADD STEMS
   - Click file → STEM_SEPARATION
   - Stems added to same project
   - Now have:
      - My Track.flp (project file)
      - My Track.mp3 (original)
      - 4 stems (vocals, drums, bass, other)

4. COMPLETE PROJECT
   - All files organized
   - Easy collaboration
   - Share entire project
   - List stems for sale separately
```

---

## 📊 **FEATURE MATRIX:**

| File Type | Auto-Groups? | Creates Project? | Playable? | Color |
|-----------|-------------|------------------|-----------|-------|
| `.ptx` | ✅ Yes | ✅ Yes | ❌ No | 🟣 Purple |
| `.flp` | ✅ Yes | ✅ Yes | ❌ No | 🟣 Purple |
| `.als` | ✅ Yes | ✅ Yes | ❌ No | 🟣 Purple |
| `.mp3` | ✅ If similar | ❌ No | ✅ Yes | 🔵 Cyan |
| `.wav` | ✅ If similar | ❌ No | ✅ Yes | 🔵 Cyan |
| `Stems` | ✅ Yes | ✅ Yes | ✅ Yes | 🟣 Purple |

---

## 🎨 **FOLDER MANAGEMENT:**

### **Add Files to Existing Project:**
```
1. Find your project folder (purple)
2. Drag new files to the folder
3. Files automatically added
4. Project stays organized
```

### **Create Manual Project:**
```
1. Click "+ NEW PROJECT" button
2. Enter project name
3. Select folder (optional)
4. Add collaborators
5. Upload files
```

### **Rename Project:**
```
1. Right-click folder
2. Select "Rename"
3. Enter new name
4. All files stay associated
```

---

## 🚀 **TESTING GUIDE:**

### **Test 1: Upload .PTX File (1 min)**
```bash
1. Create test files:
   - test.ptx (any file, rename to .ptx)
   - test vocal.mp3
   - test beat.wav

2. Drag all 3 to vault

3. ✅ Check:
   - Purple folder "test" created
   - All 3 files inside
   - .ptx NOT playable
   - .mp3/.wav playable
```

### **Test 2: Stem Separation → Project (5 min)**
```bash
1. Upload any .mp3 file
2. Click file → STEM_SEPARATION
3. Click "SEPARATE_STEMS"
4. Wait 2-5 minutes

5. ✅ Check:
   - Purple folder "[Song Name] - Stems" created
   - Original + 4 stems inside
   - All stems playable
   - Can download each stem
```

### **Test 3: Similar Files → Auto-Group (30 sec)**
```bash
1. Upload:
   - Beat v1.mp3
   - Beat v2.mp3

2. ✅ Check:
   - Cyan folder "Beat" created
   - Both files inside
   - Both playable
```

---

## 📚 **DOCUMENTATION:**

- **This Guide:** `PROJECT_FOLDERS_GUIDE.md` ⭐ YOU ARE HERE
- **Fixes Complete:** `FIXES_COMPLETE.md`
- **New Features:** `NEW_FEATURES_GUIDE.md`
- **Feature Access:** `FEATURE_ACCESS_GUIDE.md`

---

## ✅ **SUMMARY:**

**Auto-Organization Features:**
1. ✅ .PTX/.FLP files → Auto-create purple PROJECT folders
2. ✅ Similar file names → Auto-group into cyan folders
3. ✅ Stem separation → Auto-create purple PROJECT with all stems
4. ✅ Drag folders from Finder → Auto-create magenta folders
5. ✅ Smart playability detection (.ptx = not playable, .mp3 = playable)

**Color System:**
- 🟣 Purple = Projects (.ptx, .flp, stems)
- 🔵 Cyan = Auto-grouped (similar names)
- 🟢 Green = Manual
- 🟣 Magenta = Dropped from Finder

**Benefits:**
- Zero manual organization needed
- Intelligent file grouping
- Project-based workflow
- Easy collaboration
- Professional organization

**Your vault now automatically organizes everything! 🎵🚀**

**Test it:** http://localhost:3000/vault
