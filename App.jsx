import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, CartesianGrid } from "recharts";

// ── Storage keys ─────────────────────────────────────────────────────────────
const KEY_WEIGHT   = "bjjapp-weight";
const KEY_FOOD     = "bjjapp-food";
const KEY_SAVED    = "bjjapp-saved-meals";
const KEY_GYM      = "bjjapp-gym";
const KEY_PROGRAM  = "bjjapp-program";
const KEY_READINESS= "bjjapp-readiness";
const KEY_STRETCH  = "bjjapp-stretch";
const KEY_STRETCH_PROGRAM = "bjjapp-stretch-program";
const KEY_RESTDAYS = "bjjapp-restdays";

// ── Defaults ──────────────────────────────────────────────────────────────────
const WEIGHT_TARGET = 170;
const WEIGHT_START  = 159;
const CAL_GOAL      = 3300;
const PROTEIN_GOAL  = 170;
const CARB_GOAL     = 400;
const FAT_GOAL      = 100;

const DEFAULT_SAVED = [
  { id: 1, name: "Chicken + Rice", cal: 590, p: 67, c: 57, f: 7 },
  { id: 2, name: "Oats + Eggs ×3", cal: 590, p: 31, c: 69, f: 21 },
  { id: 3, name: "Whey Shake", cal: 160, p: 30, c: 8, f: 3 },
  { id: 4, name: "Greek Yogurt + Banana", cal: 235, p: 21, c: 35, f: 2 },
];

const DEFAULT_PROGRAM = {
  push: {
    label: "Push", color: "#c0392b", bg: "#fdf1f0",
    warmup: ["Foam Roll Upper Back – 1–2 min", "Push-Up Pyramid – 5/8/10", "Band Pull-Aparts – 2×20"],
    exercises: [
      { id: "inc_bench",  name: "Incline Barbell Bench",    priority: true, sets: 4, repRange: "6–8",   rest: "2–3 min", efforts: ["Moderate","Moderate","Hard ⭐","Moderate (back-off)"], cues: ["Feet planted","Chest proud","Bar to upper chest","Brace before every rep"] },
      { id: "db_press",   name: "Seated DB Shoulder Press", sets: 3, repRange: "6–8",   rest: "90 sec",  efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "lat_raise",  name: "Machine Lateral Raise",    sets: 4, repRange: "12–15", rest: "60 sec",  efforts: ["Easy","Moderate","Moderate","Hard ⭐"] },
      { id: "cable_fly",  name: "Cable Fly",                sets: 2, repRange: "12–15", rest: "60 sec",  efforts: ["Moderate","Hard ⭐"] },
      { id: "tri_press",  name: "Triceps Pressdown",        sets: 3, repRange: "10–12", rest: "60 sec",  efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "band_pull",  name: "Band Pull-Aparts",         sets: 2, repRange: "20",    rest: "–",       efforts: ["Easy","Easy"] },
    ],
  },
  pull: {
    label: "Pull", color: "#1a5fa8", bg: "#f0f6ff",
    warmup: ["Band Rows", "Deadbugs", "Good Mornings"],
    exercises: [
      { id: "rdl",        name: "Romanian Deadlift",        priority: true, sets: 3, repRange: "5–6",   rest: "2–3 min", efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "lat_pull",   name: "Neutral Grip Lat Pulldown",sets: 4, repRange: "6–8",   rest: "2 min",   efforts: ["Moderate","Moderate","Hard","Moderate"] },
      { id: "cs_row",     name: "Chest Supported Row",      sets: 4, repRange: "8–10",  rest: "90 sec",  efforts: ["Moderate","Moderate","Moderate","Hard ⭐"] },
      { id: "leg_curl",   name: "Leg Curl",                 sets: 3, repRange: "10–12", rest: "75 sec",  efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "face_pull",  name: "Face Pull",                sets: 3, repRange: "15",    rest: "60 sec",  efforts: ["Easy","Moderate","Hard ⭐"] },
      { id: "hammer",     name: "Hammer Curl",              sets: 2, repRange: "10–12", rest: "60 sec",  efforts: ["Moderate","Hard ⭐"] },
    ],
  },
  legs: {
    label: "Legs", color: "#1a7a4a", bg: "#f0faf4",
    warmup: ["Hip Flexor Stretch", "Glute Bridges", "Leg Swings"],
    exercises: [
      { id: "hip_thrust", name: "Barbell Hip Thrust",       priority: true, sets: 4, repRange: "6–8",   rest: "2–3 min", efforts: ["Moderate","Moderate","Hard ⭐","Moderate (back-off)"] },
      { id: "bss",        name: "Bulgarian Split Squat",    sets: 3, repRange: "8–10",  rest: "90 sec",  efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "leg_press",  name: "Leg Press / Seated Leg Curl", sets: 3, repRange: "10–12", rest: "90 sec", efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "stand_calf", name: "Standing Calf Raise",      priority: true, sets: 4, repRange: "8–12",  rest: "60 sec",  efforts: ["Moderate","Moderate","Moderate","Hard ⭐"] },
      { id: "seat_calf",  name: "Seated Calf Raise",        priority: true, sets: 3, repRange: "12–20", rest: "60 sec",  efforts: ["Moderate","Moderate","Hard ⭐"] },
      { id: "couch_str",  name: "Couch Stretch",            sets: 2, repRange: "1 min/leg", rest: "–",  efforts: ["Easy","Easy"] },
    ],
  },
};

const EFFORT_COLOR = { "Easy":"#aaa","Moderate":"#c08552","Hard ⭐":"#a8553f","Hard":"#a8553f","Moderate (back-off)":"#c08552" };

const STRETCH_ROUTINE = {
  morning: {
    label: "Morning Reset", duration: "7–9 min", color: "#a68b3d",
    goal: "Posture alignment + core activation + hip opening",
    rule: "Low fatigue, precise control",
    blocks: [
      {
        id: "m1", title: "Spine + Thoracic Reset", time: "2 min",
        items: [
          { id: "m1a", name: "Cat–Cow", dose: "5 slow reps", cues: ["Segment spine slowly", "Full exhale into flexion"] },
          { id: "m1b", name: "Thread the Needle", dose: "5 reps / side", cues: ["Rotate through upper back", "Hips stay stable"] },
        ],
      },
      {
        id: "m2", title: "Posture Activation", time: "3 min",
        items: [
          { id: "m2a", name: "Dead Bug", dose: "2 × 5 / side", cues: ["Exhale every rep", "Low back controlled"] },
          { id: "m2b", name: "Glute Bridge", dose: "1 × 8–10", cues: ["2-sec squeeze at top", "No lumbar arch"] },
        ],
      },
      {
        id: "m3", title: "Upper Back + Neck", time: "2 min",
        items: [
          { id: "m3a", name: "Wall Angels", dose: "1 × 8", cues: ["Ribs down", "Chin slightly tucked"] },
          { id: "m3b", name: "Band Pull-Aparts", dose: "1 × 12–15", cues: ["Upper back leads", "No shrugging"] },
        ],
      },
      {
        id: "m4", title: "BJJ Flexibility", time: "2 min",
        items: [
          { id: "m4a", name: "Half-Kneeling Hip Flexor Stretch", dose: "30s / side", cues: ["Glute tight", "Pelvis tucked"] },
          { id: "m4b", name: "Adductor Rockbacks or Frog Stretch", dose: "30–40s", cues: ["Inner thigh stretch only", "No knee pain"] },
        ],
      },
    ],
  },
  night: {
    label: "Night Reset", duration: "8–10 min", color: "#5b7a8c",
    goal: "Decompress spine + restore hips + reduce stiffness",
    rule: "Passive, slow breathing",
    blocks: [
      {
        id: "n1", title: "Spine Decompression", time: "2 min",
        items: [
          { id: "n1a", name: "Knees-to-Chest", dose: "60s", cues: [] },
          { id: "n1b", name: "Supine Twist", dose: "30s / side", cues: [] },
        ],
      },
      {
        id: "n2", title: "Hip Flexor (APT Fix)", time: "3 min",
        items: [
          { id: "n2a", name: "Couch Stretch", dose: "45s / side", cues: ["Glute squeezed", "No low back arch"] },
        ],
      },
      {
        id: "n3", title: "Adductor + Groin Care", time: "2–3 min",
        items: [
          { id: "n3a", name: "Frog Stretch", dose: "60s", cues: ["Relax breathing", "No forcing depth"] },
          { id: "n3b", name: "Figure-4 Stretch (alt.)", dose: "60s / side", cues: ["Relax breathing", "No forcing depth"] },
        ],
      },
      {
        id: "n4", title: "Neck Reset", time: "1–2 min",
        items: [
          { id: "n4a", name: "Chin Tucks (lying)", dose: "2 × 6–8", cues: [] },
          { id: "n4b", name: "Nasal Breathing (optional)", dose: "60–90s", cues: [] },
        ],
      },
    ],
  },
};


// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:"#f6f5f0", white:"#ffffff", border:"#e3e1d6", accent:"#3d4a3a",
  red:"#6b7a4f", redLight:"#eef0e6", blue:"#5b7a8c", green:"#6b8c5a", greenLight:"#f0f4ec",
  orange:"#c08552", yellow:"#a68b3d", olive:"#6b7a4f", oliveDark:"#4a5638", oliveLight:"#eef0e6",
  text:"#2c2e26", mid:"#5c5f52", dim:"#9b9d8e", placeholder:"#c4c5b8",
  rest:"#8a9b8f", restLight:"#eef2ee",
  morningCol:"#c9a648", nightCol:"#5b7a8c", bothCol:"#8a6fa3",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtDate = (s) => { const d = new Date(s+"T12:00:00"); return d.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
const fmtDateFull = (s) => { const d = new Date(s+"T12:00:00"); return d.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); };
const uid = () => Math.random().toString(36).slice(2,9);

function trendLine(entries) {
  if (entries.length < 2) return entries.map(e=>({...e,trend:null}));
  const n=entries.length, xs=entries.map((_,i)=>i), ys=entries.map(e=>e.weight);
  const sx=xs.reduce((a,b)=>a+b,0), sy=ys.reduce((a,b)=>a+b,0);
  const sxy=xs.reduce((s,x,i)=>s+x*ys[i],0), sx2=xs.reduce((s,x)=>s+x*x,0);
  const m=(n*sxy-sx*sy)/(n*sx2-sx*sx), b=(sy-m*sx)/n;
  return entries.map((e,i)=>({...e,trend:parseFloat((m*i+b).toFixed(1))}));
}
function etaWeeks(entries) {
  if (entries.length<2) return null;
  const td=trendLine(entries), last=td[td.length-1], first=td[0];
  const gp=(last.trend-first.trend)/(entries.length-1);
  if (gp<=0) return null;
  const days=(new Date(last.date)-new Date(first.date))/86400000||1;
  return Math.round(((WEIGHT_TARGET-last.trend)/gp)*(days/(entries.length-1))/7);
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Card=({children,style})=>(
  <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:16,marginBottom:12,...style}}>{children}</div>
);
const SectionLabel=({children,style})=>(
  <div style={{fontSize:10,fontWeight:700,letterSpacing:2.2,color:C.dim,textTransform:"uppercase",marginBottom:10,...style}}>{children}</div>
);
const Inp=({style,...props})=>(
  <input style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:14,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit",...style}} {...props}/>
);
const Btn=({children,onClick,variant="primary",small,style,disabled})=>{
  const base={borderRadius:9,fontWeight:600,cursor:disabled?"default":"pointer",fontFamily:"inherit",border:"none",transition:"opacity 0.15s"};
  const size=small?{padding:"6px 13px",fontSize:12}:{padding:"11px 0",fontSize:14};
  const variants={
    primary:{background:C.accent,color:"#fff"},
    secondary:{background:C.white,color:C.mid,border:`1px solid ${C.border}`},
    danger:{background:"#fff2f1",color:C.red,border:`1px solid #fcc`},
    ghost:{background:"transparent",color:C.mid,border:"none"},
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...size,...variants[variant],...style,opacity:disabled?0.45:1}}>{children}</button>;
};
const Divider=()=><div style={{height:1,background:C.border,margin:"2px 0"}}/>;

// ── Month navigation helper (shared by all long-memory calendars) ─────────────
function getMonthDays(offset) {
  const now = new Date();
  const t = new Date(now.getFullYear(), now.getMonth()+offset, 1);
  const year = t.getFullYear(), month = t.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const days = [];
  for (let i=0; i<firstDay; i++) days.push(null);
  for (let d=1; d<=daysInMonth; d++) {
    days.push(`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
  }
  return { days, monthLabel: t.toLocaleDateString("en-US",{month:"long",year:"numeric"}) };
}

// Reusable navigable month calendar — gives unlimited history (any month, any year back)
function MonthHeatmap({ getDayColor, getDayTitle, legend }) {
  const [offset, setOffset] = useState(0);
  const { days, monthLabel } = getMonthDays(offset);
  const today = todayStr();

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <Btn variant="ghost" small onClick={()=>setOffset(p=>p-1)} style={{fontSize:18,padding:"0 6px"}}>‹</Btn>
        <span style={{fontSize:12,fontWeight:700}}>{monthLabel}</span>
        <Btn variant="ghost" small onClick={()=>setOffset(p=>Math.min(0,p+1))} style={{fontSize:18,padding:"0 6px",opacity:offset===0?0.2:1}} disabled={offset===0}>›</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:9,color:C.dim,fontWeight:600,paddingBottom:3}}>{d}</div>
        ))}
        {days.map((d,i)=>{
          if(!d) return <div key={`e${i}`}/>;
          const isToday = d===today;
          const color = getDayColor(d);
          return (
            <div key={d} title={getDayTitle?getDayTitle(d):""}
              style={{aspectRatio:"1",borderRadius:6,background:color,
                border:isToday?`2px solid ${C.text}`:"1px solid transparent",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:9,color:color===C.border||color==="transparent"?C.dim:"#fff",fontWeight:isToday?700:500}}>
                {parseInt(d.split("-")[2])}
              </span>
            </div>
          );
        })}
      </div>
      {legend && <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>{legend}</div>}
    </div>
  );
}

// ── Readiness Dot ─────────────────────────────────────────────────────────────
const READINESS_COLORS=["#c0392b","#e67e22","#f1c40f","#27ae60","#1a7a4a"];
const READINESS_LABELS=["Wrecked","Tired","OK","Good","Excellent"];

// ── Workout Program Editor ────────────────────────────────────────────────────
function ProgramEditor({ program, setProgram, onClose }) {
  const [activeDay, setActiveDay] = useState("push");
  const [addName, setAddName] = useState("");
  const [addSets, setAddSets] = useState("3");
  const [addReps, setAddReps] = useState("8–12");
  const [addRest, setAddRest] = useState("60 sec");
  const [addPriority, setAddPriority] = useState(false);

  const day = program[activeDay];

  const addExercise = () => {
    if (!addName.trim()) return;
    const sets = parseInt(addSets)||3;
    const newEx = {
      id: uid(), name: addName.trim(), sets, repRange: addReps, rest: addRest,
      priority: addPriority, efforts: Array(sets).fill("Moderate"),
    };
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:[...p[activeDay].exercises,newEx]}}));
    setAddName(""); setAddSets("3"); setAddReps("8–12"); setAddPriority(false);
  };

  const removeExercise = (id) => {
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:p[activeDay].exercises.filter(e=>e.id!==id)}}));
  };

  const togglePriority = (id) => {
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:p[activeDay].exercises.map(e=>e.id===id?{...e,priority:!e.priority}:e)}}));
  };

  const updateSets = (id, val) => {
    const n = parseInt(val)||1;
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:p[activeDay].exercises.map(e=>
      e.id===id?{...e,sets:n,efforts:Array(n).fill("Moderate")}:e
    )}}));
  };

  const updateField = (id, field, val) => {
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:p[activeDay].exercises.map(e=>
      e.id===id?{...e,[field]:val}:e
    )}}));
  };

  const moveUp = (idx) => {
    if (idx===0) return;
    const arr=[...day.exercises];
    [arr[idx-1],arr[idx]]=[arr[idx],arr[idx-1]];
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:arr}}));
  };

  const moveDown = (idx) => {
    if (idx===day.exercises.length-1) return;
    const arr=[...day.exercises];
    [arr[idx],arr[idx+1]]=[arr[idx+1],arr[idx]];
    setProgram(p=>({...p,[activeDay]:{...p[activeDay],exercises:arr}}));
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",zIndex:300,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.bg,flex:1,overflowY:"auto",maxWidth:540,width:"100%",margin:"0 auto"}}>
        {/* Header */}
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 16px 12px",position:"sticky",top:0,zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Btn variant="ghost" onClick={onClose} style={{padding:"4px 0",fontSize:20,color:C.dim}}>←</Btn>
            <div style={{fontWeight:800,fontSize:17,flex:1}}>Edit Program</div>
            <Btn variant="primary" small onClick={onClose} style={{padding:"7px 16px"}}>Done</Btn>
          </div>
          {/* Day tabs */}
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {Object.entries(program).map(([k,d])=>(
              <button key={k} onClick={()=>setActiveDay(k)} style={{
                flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",
                background:activeDay===k?d.color:"transparent",
                color:activeDay===k?"#fff":C.dim,fontWeight:activeDay===k?700:400,fontSize:13,
              }}>{d.label}</button>
            ))}
          </div>
        </div>

        <div style={{padding:"0 16px 32px"}}>
          <div style={{height:12}}/>

          {/* Exercise list */}
          {day.exercises.map((ex,idx)=>(
            <Card key={ex.id} style={{marginBottom:8}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <div style={{display:"flex",flexDirection:"column",gap:2,paddingTop:2}}>
                  <button onClick={()=>moveUp(idx)} style={{background:"none",border:"none",cursor:idx===0?"default":"pointer",color:idx===0?C.border:C.dim,fontSize:13,padding:"1px 4px",lineHeight:1}}>▲</button>
                  <button onClick={()=>moveDown(idx)} style={{background:"none",border:"none",cursor:idx===day.exercises.length-1?"default":"pointer",color:idx===day.exercises.length-1?C.border:C.dim,fontSize:13,padding:"1px 4px",lineHeight:1}}>▼</button>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                    <Inp value={ex.name} onChange={e=>updateField(ex.id,"name",e.target.value)}
                      style={{fontSize:13,padding:"6px 10px",fontWeight:600,flex:1}}/>
                    <button onClick={()=>togglePriority(ex.id)}
                      title="Toggle priority lift"
                      style={{background:"none",border:"none",fontSize:16,cursor:"pointer",opacity:ex.priority?1:0.25,padding:"2px 4px"}}>⭐</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr",gap:6}}>
                    <div>
                      <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>SETS</div>
                      <Inp type="number" value={ex.sets} onChange={e=>updateSets(ex.id,e.target.value)} style={{fontSize:13,padding:"6px 8px",textAlign:"center"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>REPS</div>
                      <Inp value={ex.repRange} onChange={e=>updateField(ex.id,"repRange",e.target.value)} style={{fontSize:13,padding:"6px 8px"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>REST</div>
                      <Inp value={ex.rest} onChange={e=>updateField(ex.id,"rest",e.target.value)} style={{fontSize:13,padding:"6px 8px"}}/>
                    </div>
                  </div>
                </div>
                <Btn variant="danger" small onClick={()=>removeExercise(ex.id)} style={{padding:"5px 9px",marginTop:2,flexShrink:0}}>✕</Btn>
              </div>
            </Card>
          ))}

          {/* Add new exercise */}
          <Card style={{background:C.bg,border:`1px dashed ${C.border}`}}>
            <SectionLabel>Add exercise</SectionLabel>
            <Inp value={addName} onChange={e=>setAddName(e.target.value)} placeholder="Exercise name" style={{marginBottom:8}}/>
            <div style={{display:"grid",gridTemplateColumns:"60px 1fr 1fr",gap:6,marginBottom:10}}>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>SETS</div>
                <Inp type="number" value={addSets} onChange={e=>setAddSets(e.target.value)} style={{fontSize:13,padding:"6px 8px",textAlign:"center"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>REPS</div>
                <Inp value={addReps} onChange={e=>setAddReps(e.target.value)} style={{fontSize:13,padding:"6px 8px"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>REST</div>
                <Inp value={addRest} onChange={e=>setAddRest(e.target.value)} style={{fontSize:13,padding:"6px 8px"}}/>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <button onClick={()=>setAddPriority(!addPriority)}
                style={{background:"none",border:"none",fontSize:16,cursor:"pointer",opacity:addPriority?1:0.3}}>⭐</button>
              <span style={{fontSize:12,color:C.dim}}>Priority lift</span>
            </div>
            <Btn variant="primary" onClick={addExercise} style={{width:"100%"}}>Add exercise</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Session Detail / Edit Modal ───────────────────────────────────────────────
function SessionModal({ session, dayKey, program, onClose, onDelete, onSave }) {
  const day = program[dayKey];
  const [ew, setEw] = useState(()=>{
    const w={};
    day.exercises.forEach(ex=>{w[ex.id]=(session.sets[ex.id]||[]).map(s=>s.weight||"");});
    return w;
  });
  const [er, setEr] = useState(()=>{
    const r={};
    day.exercises.forEach(ex=>{r[ex.id]=(session.sets[ex.id]||[]).map(s=>s.reps||"");});
    return r;
  });
  const [eNote, setENote] = useState(session.note||"");
  const [eDate, setEDate] = useState(session.date);
  const [eBjj, setEBjj] = useState(session.bjjHard||false);
  const [confirmDel, setConfirmDel] = useState(false);

  const save = () => {
    const sets={};
    day.exercises.forEach(ex=>{
      sets[ex.id]=(ew[ex.id]||[]).map((w,i)=>({weight:w,reps:(er[ex.id]||[])[i]||""}));
    });
    onSave({...session,date:eDate,sets,note:eNote,bjjHard:eBjj});
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",zIndex:200,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.bg,flex:1,overflowY:"auto",maxWidth:540,width:"100%",margin:"0 auto"}}>
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 16px 12px",position:"sticky",top:0,zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Btn variant="ghost" onClick={onClose} style={{padding:"4px 0",fontSize:20,color:C.dim}}>←</Btn>
            <div style={{fontWeight:800,fontSize:17,flex:1}}>Edit {day.label} Session</div>
            <input type="date" value={eDate} onChange={e=>setEDate(e.target.value)}
              style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
          </div>
        </div>
        <div style={{padding:"12px 16px 32px"}}>
          <Card style={{background:eBjj?"#fff8f0":C.white,borderColor:eBjj?"#f5c89a":C.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>BJJ hard that day</div>
                <div style={{fontSize:12,color:C.dim}}>Reduced effort session</div>
              </div>
              <button onClick={()=>setEBjj(!eBjj)} style={{width:44,height:24,borderRadius:999,background:eBjj?"#e67e22":C.border,border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:eBjj?23:3,transition:"left 0.2s"}}/>
              </button>
            </div>
          </Card>

          {day.exercises.map(ex=>{
            const exSets=ex.sets||3;
            return (
              <Card key={ex.id}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:8}}>
                  {ex.priority&&<span style={{color:day.color,marginRight:4}}>⭐</span>}{ex.name}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr",gap:6,marginBottom:4}}>
                  {["#","Weight","Reps"].map(h=><div key={h} style={{fontSize:10,color:C.dim}}>{h}</div>)}
                </div>
                {Array.from({length:exSets},(_,si)=>(
                  <div key={si} style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr",gap:6,marginBottom:6}}>
                    <div style={{fontSize:12,color:C.dim,paddingTop:10}}>{si+1}</div>
                    <input type="number" value={(ew[ex.id]||[])[si]||""} placeholder="lbs"
                      onChange={e=>{const a=[...(ew[ex.id]||[])];a[si]=e.target.value;setEw(p=>({...p,[ex.id]:a}));}}
                      style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
                    <input type="number" value={(er[ex.id]||[])[si]||""} placeholder="reps"
                      onChange={e=>{const a=[...(er[ex.id]||[])];a[si]=e.target.value;setEr(p=>({...p,[ex.id]:a}));}}
                      style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
                  </div>
                ))}
              </Card>
            );
          })}

          <Card>
            <SectionLabel>Note</SectionLabel>
            <Inp value={eNote} onChange={e=>setENote(e.target.value)} placeholder="Notes…" style={{marginBottom:12}}/>
            <Btn variant="primary" onClick={save} style={{width:"100%",marginBottom:8}}>Save changes</Btn>
            {!confirmDel
              ? <Btn variant="danger" onClick={()=>setConfirmDel(true)} style={{width:"100%"}}>Delete session</Btn>
              : <div style={{display:"flex",gap:8}}>
                  <Btn variant="danger" onClick={onDelete} style={{flex:1}}>Yes, delete</Btn>
                  <Btn variant="secondary" onClick={()=>setConfirmDel(false)} style={{flex:1}}>Cancel</Btn>
                </div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ weightEntries, gymLog, foodLog, stretchLog, restDays, setRestDays, readiness, setReadiness, program }) {
  const today = todayStr();
  const todayFood = foodLog[today]||[];
  const todayCal = todayFood.reduce((s,f)=>s+f.cal,0);
  const latestWeight = weightEntries.length ? weightEntries[weightEntries.length-1].weight : WEIGHT_START;
  const todayReadiness = readiness[today];

  const totalSessions = Object.values(gymLog).reduce((s,arr)=>s+(arr?.length||0),0);
  const lastSessionType = Object.entries(gymLog)
    .flatMap(([k,arr])=>(arr||[]).map(s=>({...s,dayKey:k})))
    .sort((a,b)=>b.date.localeCompare(a.date))[0];

  // Next day suggestion based on last session
  const nextSuggestion = ()=>{
    if(!lastSessionType) return "Push";
    const order=["push","pull","legs"];
    const idx=order.indexOf(lastSessionType.dayKey);
    return program[order[(idx+1)%3]].label;
  };

  // Weekly session count (last 7 days)
  const last7Keys = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().split("T")[0];});
  const weekSessions = Object.values(gymLog).flatMap(arr=>arr||[]).filter(s=>last7Keys.includes(s.date)).length;

  const pct = Math.min(100,Math.round(((latestWeight-WEIGHT_START)/(WEIGHT_TARGET-WEIGHT_START))*100));
  const calPct = Math.min(100,Math.round((todayCal/CAL_GOAL)*100));

  // Readiness logger
  const logReadiness = (val) => setReadiness(p=>({...p,[today]:val}));

  // Personal records per exercise
  const prs = {};
  Object.entries(gymLog).forEach(([dk,sessions])=>{
    (sessions||[]).forEach(s=>{
      Object.entries(s.sets||{}).forEach(([exId,sets])=>{
        sets.forEach(set=>{
          const w=parseFloat(set.weight);
          if(!isNaN(w)&&w>0){ if(!prs[exId]||w>prs[exId].weight) prs[exId]={weight:w,date:s.date,dayKey:dk}; }
        });
      });
    });
  });

  // Get exercise name from program
  const exName=(exId)=>{
    for(const day of Object.values(program)){
      const ex=day.exercises.find(e=>e.id===exId);
      if(ex) return ex.name;
    }
    return exId;
  };

  const topPRs=Object.entries(prs).sort((a,b)=>b[1].weight-a[1].weight).slice(0,5);

  // 7-day combined consistency row
  const last7Days = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const ds=d.toISOString().split("T")[0];
    const hadGym = Object.values(gymLog).some(arr=>(arr||[]).some(s=>s.date===ds));
    const cal = (foodLog[ds]||[]).reduce((s,f)=>s+f.cal,0);
    const hadFood = cal >= CAL_GOAL*0.85;
    const stretch = stretchLog[ds]||{};
    const hadStretch = !!(stretch.morning || stretch.night);
    const hadRest = !!restDays[ds];
    return { date: ds, hadGym, hadFood, hadStretch, hadRest };
  });

  // Smart rest-day logic: consecutive training days (no rest day in between)
  const allSessionDates = {};
  Object.values(gymLog).forEach(arr=>(arr||[]).forEach(s=>{allSessionDates[s.date]=true;}));
  const consecutiveTrainingDays = () => {
    let count=0; let d=new Date();
    while(true){
      const ds=d.toISOString().split("T")[0];
      if(restDays[ds]) break;
      if(allSessionDates[ds]){ count++; d.setDate(d.getDate()-1); }
      else break;
    }
    return count;
  };
  const trainStreak = consecutiveTrainingDays();
  const restedToday = !!restDays[today];
  const trainedToday = !!allSessionDates[today];

  // Combine streak length + recent low readiness into one suggestion
  const recentReadinessLow = [0,1,2].some(i=>{
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toISOString().split("T")[0];
    return readiness[ds] && readiness[ds]<=2;
  });
  const suggestRest = !restedToday && !trainedToday && (trainStreak>=5 || (trainStreak>=3 && recentReadinessLow));

  const toggleTodayRest = () => setRestDays(p=>{
    const next={...p};
    if(next[today]) delete next[today]; else next[today]=true;
    return next;
  });

  return (
    <div>
      {/* Today header */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:11,color:C.dim,marginBottom:2}}>{fmtDateFull(today)}</div>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:-0.5}}>Good session, let's go.</div>
      </div>

      {/* Readiness */}
      <Card>
        <SectionLabel>How do you feel today?</SectionLabel>
        <div style={{display:"flex",gap:8,justifyContent:"space-between"}}>
          {READINESS_LABELS.map((label,i)=>(
            <button key={i} onClick={()=>logReadiness(i+1)}
              style={{flex:1,padding:"10px 4px",borderRadius:10,border:`2px solid ${todayReadiness===i+1?READINESS_COLORS[i]:C.border}`,
                background:todayReadiness===i+1?READINESS_COLORS[i]+"18":"transparent",
                cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
              <div style={{fontSize:18,marginBottom:3}}>{["😩","😔","😐","💪","🔥"][i]}</div>
              <div style={{fontSize:9,color:todayReadiness===i+1?READINESS_COLORS[i]:C.dim,fontWeight:600,letterSpacing:0.5}}>{label.toUpperCase()}</div>
            </button>
          ))}
        </div>
        {todayReadiness && (
          <div style={{marginTop:10,fontSize:12,color:C.mid,padding:"7px 10px",background:C.bg,borderRadius:8}}>
            {todayReadiness<=2 && "⚡ Drop all Hard sets to Moderate today. Recovery first."}
            {todayReadiness===3 && "✓ Train as written. Stay conservative on the hard sets."}
            {todayReadiness>=4 && "🔥 Full effort today. Push your hard sets."}
          </div>
        )}
      </Card>

      {/* Rest day suggestion (only surfaces when it matters) */}
      {(suggestRest || restedToday) && (
        <Card style={{background:restedToday?C.restLight:"#fff8f0",borderColor:restedToday?"#cdd6cf":"#f5c89a"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>
                {restedToday ? "😌 Resting today" : `⚡ ${trainStreak} days straight`}
              </div>
              <div style={{fontSize:12,color:C.dim,marginTop:2}}>
                {restedToday
                  ? "Good call — recovery is part of the program."
                  : recentReadinessLow
                    ? "Your readiness has been low — your body may need a break."
                    : "Consider a rest day. Consistent training needs consistent recovery."}
              </div>
            </div>
            <Btn variant={restedToday?"secondary":"primary"} small onClick={toggleTodayRest} style={restedToday?{}:{background:C.rest}}>
              {restedToday?"Undo":"Rest today"}
            </Btn>
          </div>
        </Card>
      )}

      {/* 7-day consistency overview */}
      <Card>
        <SectionLabel>This week</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:6,alignItems:"center",marginBottom:6}}>
          <div/>
          {last7Days.map(d=>(
            <div key={d.date} style={{textAlign:"center",fontSize:9,color:d.date===today?C.text:C.dim,fontWeight:d.date===today?700:400}}>
              {new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"narrow"})}
            </div>
          ))}
        </div>
        {[
          {label:"Gym",key:"hadGym",color:C.olive},
          {label:"Food",key:"hadFood",color:"#c08552"},
          {label:"Stretch",key:"hadStretch",color:"#5b7a8c"},
        ].map(row=>(
          <div key={row.key} style={{display:"grid",gridTemplateColumns:"60px repeat(7,1fr)",gap:6,alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:11,color:C.mid}}>{row.label}</div>
            {last7Days.map(d=>{
              const isRestCell = row.key==="hadGym" && d.hadRest && !d.hadGym;
              return (
                <div key={d.date} title={isRestCell?"Rest day":""} style={{
                  aspectRatio:"1",borderRadius:6,
                  background:d[row.key]?row.color:isRestCell?C.restLight:C.bg,
                  border:`1px solid ${d[row.key]?row.color:isRestCell?C.rest+"88":C.border}`,
                }}/>
              );
            })}
          </div>
        ))}
      </Card>


      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
        <Card style={{marginBottom:0}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Weight</div>
          <div style={{fontSize:22,fontWeight:800}}>{latestWeight}<span style={{fontSize:12,color:C.dim,marginLeft:2}}>lbs</span></div>
          <div style={{fontSize:11,color:C.dim,marginTop:2}}>Goal: {WEIGHT_TARGET} lbs · {pct}%</div>
          <div style={{background:C.bg,borderRadius:999,height:4,marginTop:6,overflow:"hidden"}}>
            <div style={{width:`${pct}%`,height:"100%",background:C.red,borderRadius:999,transition:"width 0.4s"}}/>
          </div>
        </Card>
        <Card style={{marginBottom:0}}>
          <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Calories today</div>
          <div style={{fontSize:22,fontWeight:800}}>{todayCal}<span style={{fontSize:12,color:C.dim,marginLeft:2}}>kcal</span></div>
          <div style={{fontSize:11,color:todayCal>=CAL_GOAL?C.green:C.dim,marginTop:2}}>
            {todayCal>=CAL_GOAL?"✓ Goal reached":`${CAL_GOAL-todayCal} to go`}
          </div>
          <div style={{background:C.bg,borderRadius:999,height:4,marginTop:6,overflow:"hidden"}}>
            <div style={{width:`${calPct}%`,height:"100%",background:todayCal>=CAL_GOAL?C.green:C.orange,borderRadius:999,transition:"width 0.4s"}}/>
          </div>
        </Card>
      </div>

      {/* Next workout + this week */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Next up</div>
            <div style={{fontSize:16,fontWeight:700}}>{nextSuggestion()} Day</div>
            <div style={{fontSize:12,color:C.dim,marginTop:2}}>{lastSessionType?`Last: ${fmtDate(lastSessionType.date)}`:"No sessions yet"}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:C.dim,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>This week</div>
            <div style={{fontSize:22,fontWeight:800}}>{weekSessions}<span style={{fontSize:12,color:C.dim,marginLeft:2}}>/ 3</span></div>
            <div style={{fontSize:11,color:weekSessions>=3?C.green:C.dim}}>{weekSessions>=3?"Week complete 🎯":"sessions"}</div>
          </div>
        </div>
      </Card>

      {/* PRs */}
      {topPRs.length>0&&(
        <Card>
          <SectionLabel>Personal records</SectionLabel>
          {topPRs.map(([exId,pr])=>(
            <div key={exId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>{exName(exId)}</div>
                <div style={{fontSize:11,color:C.dim}}>{fmtDate(pr.date)}</div>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:C.red}}>{pr.weight} <span style={{fontSize:11,color:C.dim,fontWeight:400}}>lbs</span></div>
            </div>
          ))}
        </Card>
      )}

      {/* Total sessions */}
      <Card style={{background:"#f9f9f7"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,color:C.mid}}>Total gym sessions logged</div>
          <div style={{fontSize:20,fontWeight:800}}>{totalSessions}</div>
        </div>
      </Card>
    </div>
  );
}

// ── Gym Tab ───────────────────────────────────────────────────────────────────
// ── Gym Progress View ─────────────────────────────────────────────────────────
function GymProgressView({ program, gymLog, progressDay, setProgressDay, progressExId, setProgressExId, exerciseHistory, weeklyVolume }) {
  const day = program[progressDay];
  const exercises = day.exercises;
  const activeExId = progressExId && exercises.find(e=>e.id===progressExId) ? progressExId : (exercises[0]?.id || null);

  const history = activeExId ? exerciseHistory(progressDay, activeExId) : [];
  const chartData = history.map(h => ({ date: h.date, weight: h.weight }));
  const firstWeight = history[0]?.weight;
  const lastWeight = history[history.length-1]?.weight;
  const gain = (firstWeight!=null && lastWeight!=null) ? (lastWeight-firstWeight) : null;
  const allTimeBest = history.length ? Math.max(...history.map(h=>h.weight)) : null;

  const volume = weeklyVolume(progressDay);
  const maxVol = Math.max(...volume.map(v=>v.volume), 1);

  const activeEx = exercises.find(e=>e.id===activeExId);

  const ChartTip = ({active, payload}) => {
    if(!active||!payload?.length) return null;
    return <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 11px",fontSize:12}}>
      <div style={{color:C.dim}}>{fmtDate(payload[0].payload.date)}</div>
      <div style={{fontWeight:700}}>{payload[0].value} lbs</div>
    </div>;
  };

  return (
    <div>
      {/* Day selector */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {Object.entries(program).map(([key,d])=>(
          <button key={key} onClick={()=>{setProgressDay(key);setProgressExId(null);}} style={{
            flex:1,padding:"8px 0",borderRadius:9,cursor:"pointer",fontFamily:"inherit",border:`1px solid ${progressDay===key?d.color:C.border}`,
            background:progressDay===key?d.color:C.white,color:progressDay===key?"#fff":C.mid,fontWeight:600,fontSize:12,
          }}>{d.label}</button>
        ))}
      </div>

      {/* Exercise selector pills */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
        {exercises.map(ex=>{
          const hasData = (gymLog[progressDay]||[]).some(s=>s.sets[ex.id]);
          return (
            <button key={ex.id} onClick={()=>setProgressExId(ex.id)} style={{
              padding:"6px 11px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,
              border:`1px solid ${activeExId===ex.id?day.color:C.border}`,
              background:activeExId===ex.id?day.color+"15":C.white,
              color:activeExId===ex.id?day.color:hasData?C.mid:C.placeholder,fontWeight:activeExId===ex.id?700:500,
            }}>{ex.priority&&"⭐ "}{ex.name}</button>
          );
        })}
      </div>

      {/* Strength progression chart */}
      {activeEx && (
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <SectionLabel style={{margin:0}}>{activeEx.name} — strength</SectionLabel>
            {allTimeBest && <span style={{fontSize:11,color:day.color,fontWeight:700}}>PR: {allTimeBest} lbs</span>}
          </div>
          {history.length === 0 ? (
            <div style={{fontSize:13,color:C.dim,textAlign:"center",padding:"24px 0"}}>No data yet. Log a {day.label.toLowerCase()} session to start tracking.</div>
          ) : history.length === 1 ? (
            <div style={{fontSize:13,color:C.mid,textAlign:"center",padding:"24px 0"}}>First entry: <strong>{history[0].weight} lbs</strong> on {fmtDate(history[0].date)}. Log another session to see your trend.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData} margin={{top:6,right:10,left:-22,bottom:0}}>
                  <CartesianGrid stroke={C.border} vertical={false}/>
                  <XAxis dataKey="date" tickFormatter={fmtDate} tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis domain={["auto","auto"]} tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Line type="monotone" dataKey="weight" stroke={day.color} strokeWidth={2.5} dot={{fill:day.color,r:3.5}} activeDot={{r:5}}/>
                </LineChart>
              </ResponsiveContainer>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,color:C.dim}}>First: <strong style={{color:C.text}}>{firstWeight} lbs</strong></div>
                <div style={{fontSize:12,color:C.dim}}>Now: <strong style={{color:C.text}}>{lastWeight} lbs</strong></div>
                <div style={{fontSize:12,color:gain>0?C.green:C.dim}}>{gain>0?"+":""}{gain} lbs</div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Weekly volume */}
      <Card>
        <SectionLabel>{day.label} — weekly volume</SectionLabel>
        <div style={{fontSize:11,color:C.dim,marginBottom:10}}>Total weight × reps lifted per week</div>
        {volume.length===0 ? (
          <div style={{fontSize:13,color:C.dim,textAlign:"center",padding:"16px 0"}}>No sessions logged yet.</div>
        ) : (
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
            {volume.map((v,i)=>(
              <div key={v.week} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                <div title={`${v.volume.toLocaleString()} lbs`} style={{
                  width:"100%",borderRadius:"4px 4px 0 0",background:day.color,
                  height:`${Math.max(6,(v.volume/maxVol)*100)}%`,opacity:i===volume.length-1?1:0.45,
                  transition:"height 0.3s",
                }}/>
                <div style={{fontSize:8,color:C.dim,marginTop:3}}>{fmtDate(v.week)}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


// ── Gym Tab ───────────────────────────────────────────────────────────────────
function GymTab({ gymLog, setGymLog, program, setProgram, restDays, setRestDays }) {
  const [screen, setScreen] = useState("overview");
  const [overviewView, setOverviewView] = useState("log"); // "log" | "progress"
  const [progressDay, setProgressDay] = useState("push");
  const [progressExId, setProgressExId] = useState(null);
  const [sessionDate, setSessionDate] = useState(todayStr());
  const [weights, setWeights] = useState({});
  const [reps, setReps] = useState({});
  const [bjjHard, setBjjHard] = useState(false);
  const [note, setNote] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [calOffset, setCalOffset] = useState(0);

  const activeDay = screen.startsWith("log:") ? screen.slice(4) : null;
  const screenType = screen.split(":")[0];

  const startLog = (dayKey) => {
    const day = program[dayKey];
    const w={}, r={};
    day.exercises.forEach(ex=>{w[ex.id]=Array(ex.sets).fill("");r[ex.id]=Array(ex.sets).fill("");});
    const sessions=gymLog[dayKey]||[];
    if(sessions.length>0){
      const last=sessions[sessions.length-1];
      day.exercises.forEach(ex=>{
        if(last.sets[ex.id]){w[ex.id]=last.sets[ex.id].map(s=>s.weight||"");r[ex.id]=last.sets[ex.id].map(s=>s.reps||"");}
      });
    }
    setWeights(w);setReps(r);setBjjHard(false);setNote("");setSessionDate(todayStr());
    setScreen(`log:${dayKey}`);
  };

  const saveSession = () => {
    const day=program[activeDay];
    const sets={};
    day.exercises.forEach(ex=>{sets[ex.id]=(weights[ex.id]||[]).map((w,i)=>({weight:w,reps:(reps[ex.id]||[])[i]||""}));});
    const session={date:sessionDate,sets,bjjHard,note,id:Date.now()};
    setGymLog(prev=>({...prev,[activeDay]:[...(prev[activeDay]||[]),session].sort((a,b)=>a.date.localeCompare(b.date))}));
    setScreen("overview");
  };

  const deleteSession=(dayKey,id)=>{setGymLog(prev=>({...prev,[dayKey]:(prev[dayKey]||[]).filter(s=>s.id!==id)}));setEditingSession(null);};
  const updateSession=(dayKey,updated)=>{setGymLog(prev=>({...prev,[dayKey]:(prev[dayKey]||[]).map(s=>s.id===updated.id?updated:s).sort((a,b)=>a.date.localeCompare(b.date))}));setEditingSession(null);};

  const lastBest=(dayKey,exId)=>{
    const sessions=gymLog[dayKey]||[];
    if(!sessions.length) return null;
    const last=sessions[sessions.length-1];
    if(!last.sets[exId]) return null;
    const vals=last.sets[exId].map(s=>parseFloat(s.weight)).filter(v=>!isNaN(v));
    return vals.length?Math.max(...vals):null;
  };

  // History of top-set weight per session for a given exercise, in chrono order
  const exerciseHistory = (dayKey, exId) => {
    const sessions = gymLog[dayKey] || [];
    return sessions
      .map(s => {
        const sets = s.sets[exId];
        if (!sets) return null;
        const vals = sets.map(x => parseFloat(x.weight)).filter(v => !isNaN(v));
        if (!vals.length) return null;
        return { date: s.date, weight: Math.max(...vals) };
      })
      .filter(Boolean);
  };

  // Total weekly volume (sum of weight×reps) per day-type, last 8 weeks
  const weeklyVolume = (dayKey) => {
    const sessions = gymLog[dayKey] || [];
    const weeks = {};
    sessions.forEach(s => {
      const d = new Date(s.date + "T12:00:00");
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const wk = weekStart.toISOString().split("T")[0];
      let vol = 0;
      Object.values(s.sets || {}).forEach(sets => {
        sets.forEach(set => {
          const w = parseFloat(set.weight), r = parseFloat(set.reps);
          if (!isNaN(w) && !isNaN(r)) vol += w * r;
        });
      });
      weeks[wk] = (weeks[wk] || 0) + vol;
    });
    return Object.entries(weeks).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8).map(([wk,vol])=>({week:wk,volume:Math.round(vol)}));
  };

  const allSessionDates={};
  Object.entries(gymLog).forEach(([dk,sessions])=>{(sessions||[]).forEach(s=>{if(!allSessionDates[s.date])allSessionDates[s.date]=[];allSessionDates[s.date].push(dk);});});

  const isRestDay = (d) => !!restDays[d];
  const toggleRestDay = (d) => {
    setRestDays(prev => {
      const next = {...prev};
      if (next[d]) delete next[d];
      else next[d] = true;
      return next;
    });
  };

  // Consecutive days trained without a rest day in between (counts back from today)
  const consecutiveTrainingDays = () => {
    let count = 0;
    let d = new Date();
    while (true) {
      const ds = d.toISOString().split("T")[0];
      if (isRestDay(ds)) break;
      const trained = allSessionDates[ds] && allSessionDates[ds].length > 0;
      if (trained) { count++; d.setDate(d.getDate()-1); }
      else break;
    }
    return count;
  };
  const streakSinceRest = consecutiveTrainingDays();

  // Has user trained or rested today already?
  const today = todayStr();
  const trainedToday = allSessionDates[today] && allSessionDates[today].length > 0;
  const restedToday = isRestDay(today);

  const getCalDays=(offset)=>{
    const now=new Date();
    const t=new Date(now.getFullYear(),now.getMonth()+offset,1);
    const year=t.getFullYear(),month=t.getMonth();
    const firstDay=new Date(year,month,1).getDay();
    const daysInMonth=new Date(year,month+1,0).getDate();
    const days=[];
    for(let i=0;i<firstDay;i++) days.push(null);
    for(let d=1;d<=daysInMonth;d++){
      const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      days.push(ds);
    }
    return {days,monthLabel:t.toLocaleDateString("en-US",{month:"long",year:"numeric"})};
  };

  // ── Overview ──
  if(screenType==="overview"){
    const {days,monthLabel}=getCalDays(calOffset);
    const totalSessions=Object.values(gymLog).reduce((s,arr)=>s+(arr?.length||0),0);

    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:800,fontSize:18}}>Workout Log</div>
          <Btn variant="secondary" small onClick={()=>setShowEditor(true)} style={{padding:"6px 14px"}}>✎ Edit program</Btn>
        </div>

        {/* Log / Progress toggle */}
        <div style={{display:"flex",gap:6,marginBottom:14,background:C.bg,borderRadius:10,padding:3}}>
          {[["log","📋 Log"],["progress","📈 Progress"]].map(([key,label])=>(
            <button key={key} onClick={()=>setOverviewView(key)} style={{
              flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",
              background:overviewView===key?C.white:"transparent",
              color:overviewView===key?C.text:C.dim,fontWeight:overviewView===key?700:500,fontSize:13,
              boxShadow:overviewView===key?"0 1px 3px rgba(0,0,0,0.08)":"none",transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {overviewView==="progress" ? (
          <GymProgressView
            program={program}
            gymLog={gymLog}
            progressDay={progressDay}
            setProgressDay={setProgressDay}
            progressExId={progressExId}
            setProgressExId={setProgressExId}
            exerciseHistory={exerciseHistory}
            weeklyVolume={weeklyVolume}
          />
        ) : (
        <>
        {/* Rest day suggestion / control */}
        <Card style={{
          background: streakSinceRest>=5 ? "#fff8f0" : restedToday ? C.restLight : C.white,
          borderColor: streakSinceRest>=5 ? "#f5c89a" : restedToday ? "#cdd6cf" : C.border,
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>
                {restedToday ? "😌 Resting today" : streakSinceRest>=5 ? `⚡ ${streakSinceRest} days straight` : "Rest days"}
              </div>
              <div style={{fontSize:12,color:C.dim,marginTop:2}}>
                {restedToday
                  ? "Logged as a rest day"
                  : streakSinceRest>=5
                    ? "Consider taking a rest day soon — recovery drives the gains."
                    : streakSinceRest>0
                      ? `${streakSinceRest} consecutive training day${streakSinceRest>1?"s":""}`
                      : "Mark today if you're taking a planned day off"}
              </div>
            </div>
            <Btn
              variant={restedToday?"secondary":"primary"}
              small
              onClick={()=>toggleRestDay(today)}
              disabled={trainedToday}
              style={trainedToday?{}:restedToday?{}:{background:C.rest}}
            >
              {restedToday ? "Undo" : "Mark rest day"}
            </Btn>
          </div>
          {trainedToday && !restedToday && (
            <div style={{fontSize:11,color:C.dim,marginTop:8}}>You already trained today — can't mark it as a rest day.</div>
          )}
        </Card>

        {/* Day cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
          {Object.entries(program).map(([key,day])=>{
            const sessions=gymLog[key]||[];
            const last=sessions.length?fmtDate(sessions[sessions.length-1].date):"—";
            return (
              <button key={key} onClick={()=>startLog(key)} style={{
                background:C.white,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 8px",
                cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"border-color 0.15s",
              }}>
                <div style={{width:9,height:9,borderRadius:"50%",background:day.color,margin:"0 auto 8px"}}/>
                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{day.label}</div>
                <div style={{fontSize:11,color:C.dim,marginTop:3}}>{sessions.length} sessions</div>
                <div style={{fontSize:10,color:C.dim,marginTop:1}}>Last: {last}</div>
              </button>
            );
          })}
        </div>

        {/* Calendar */}
        <Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <Btn variant="ghost" small onClick={()=>setCalOffset(p=>p-1)} style={{fontSize:18,padding:"0 6px"}}>‹</Btn>
            <span style={{fontSize:12,fontWeight:700}}>{monthLabel}</span>
            <Btn variant="ghost" small onClick={()=>setCalOffset(p=>Math.min(0,p+1))} style={{fontSize:18,padding:"0 6px",opacity:calOffset===0?0.2:1}} disabled={calOffset===0}>›</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
              <div key={d} style={{textAlign:"center",fontSize:9,color:C.dim,fontWeight:600,paddingBottom:3}}>{d}</div>
            ))}
            {days.map((d,i)=>{
              if(!d) return <div key={`e${i}`}/>;
              const sess=allSessionDates[d];
              const has=sess&&sess.length>0;
              const rested=isRestDay(d);
              const isToday=d===todayStr();
              const col=has?program[sess[0]]?.color||C.dim:null;
              return (
                <div key={d} title={has?`${sess.map(x=>program[x]?.label||x).join(", ")} – ${fmtDate(d)}`:rested?`Rest day – ${fmtDate(d)}`:""}
                  style={{aspectRatio:"1",borderRadius:6,
                    background:has?col+"22":rested?C.restLight:"transparent",
                    border:isToday?`2px solid ${C.red}`:has?`1px solid ${col}44`:rested?`1px solid ${C.rest}66`:`1px solid transparent`,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:10,color:has?col:rested?C.rest:isToday?C.red:C.dim,fontWeight:has||rested||isToday?700:400}}>
                    {rested&&!has?"–":parseInt(d.split("-")[2])}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,flexWrap:"wrap",gap:6}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {Object.entries(program).map(([k,d])=>(
                <span key={k} style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:3}}>
                  <span style={{width:7,height:7,borderRadius:2,background:d.color,display:"inline-block"}}/>{d.label}
                </span>
              ))}
              <span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:3}}>
                <span style={{width:7,height:7,borderRadius:2,background:C.rest,display:"inline-block"}}/>Rest
              </span>
            </div>
            <span style={{fontSize:10,color:C.dim}}>{totalSessions} total</span>
          </div>
        </Card>

        {/* Session history per day */}
        {Object.entries(program).map(([key,day])=>{
          const sessions=[...(gymLog[key]||[])].reverse();
          if(!sessions.length) return null;
          return (
            <Card key={key}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:day.color}}/>
                  <SectionLabel style={{margin:0}}>{day.label}</SectionLabel>
                </div>
                <span style={{fontSize:11,color:C.dim}}>{sessions.length} sessions</span>
              </div>
              {sessions.map(s=>(
                <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div>
                    <span style={{fontSize:13,fontWeight:600}}>{fmtDate(s.date)}</span>
                    {s.bjjHard&&<span style={{fontSize:11,color:C.orange,marginLeft:8}}>⚡ BJJ hard</span>}
                    {s.note&&<div style={{fontSize:12,color:C.dim,marginTop:1}}>{s.note}</div>}
                  </div>
                  <Btn variant="secondary" small onClick={()=>setEditingSession({session:s,dayKey:key})} style={{padding:"5px 12px"}}>Edit</Btn>
                </div>
              ))}
            </Card>
          );
        })}

        {/* Rules */}
        <Card style={{background:"#fffdf0",borderColor:"#f0e68c"}}>
          <SectionLabel style={{color:C.yellow}}>Golden rules</SectionLabel>
          {["Only one truly hard set per exercise.","Never fail a rep — stop at RIR 1.","BJJ hard day → drop all Hard sets to Moderate.","Add weight only when you hit the top rep range with perfect form."].map((r,i)=>(
            <div key={i} style={{fontSize:12,color:C.mid,marginBottom:5,display:"flex",gap:8}}>
              <span style={{color:C.yellow,fontWeight:700,flexShrink:0}}>{i+1}.</span>{r}
            </div>
          ))}
        </Card>
        </>
        )}

        {editingSession&&(
          <SessionModal session={editingSession.session} dayKey={editingSession.dayKey} program={program}
            onClose={()=>setEditingSession(null)}
            onDelete={()=>deleteSession(editingSession.dayKey,editingSession.session.id)}
            onSave={updated=>updateSession(editingSession.dayKey,updated)}/>
        )}
        {showEditor&&<ProgramEditor program={program} setProgram={setProgram} onClose={()=>setShowEditor(false)}/>}
      </div>
    );
  }

  // ── Log session ──
  if(screenType==="log"&&activeDay){
    const day=program[activeDay];
    return (
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <Btn variant="ghost" onClick={()=>setScreen("overview")} style={{fontSize:22,padding:"0",color:C.dim}}>←</Btn>
          <div style={{flex:1}}>
            <div style={{fontWeight:800,fontSize:18}}>{day.label} Day</div>
            <div style={{fontSize:12,color:C.dim}}>3× / week</div>
          </div>
          <input type="date" value={sessionDate} onChange={e=>setSessionDate(e.target.value)}
            style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit"}}/>
        </div>

        <Card style={{background:bjjHard?"#fff8f0":C.white,borderColor:bjjHard?"#f5c89a":C.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:600,fontSize:14}}>BJJ was hard today</div>
              <div style={{fontSize:12,color:C.dim}}>Drops all Hard sets → Moderate</div>
            </div>
            <button onClick={()=>setBjjHard(!bjjHard)} style={{width:44,height:24,borderRadius:999,background:bjjHard?"#e67e22":C.border,border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:bjjHard?23:3,transition:"left 0.2s"}}/>
            </button>
          </div>
        </Card>

        <Card style={{background:"#f9f9f7"}}>
          <SectionLabel>Warm-up</SectionLabel>
          {day.warmup.map((w,i)=><div key={i} style={{fontSize:13,color:C.mid,marginBottom:4}}>· {w}</div>)}
        </Card>

        {day.exercises.map(ex=>{
          const best=lastBest(activeDay,ex.id);
          return (
            <Card key={ex.id}>
              <div style={{marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:15}}>
                  {ex.priority&&<span style={{color:day.color,marginRight:4}}>⭐</span>}{ex.name}
                </div>
                <div style={{fontSize:12,color:C.dim,marginTop:2,display:"flex",gap:10,flexWrap:"wrap"}}>
                  <span>{ex.sets}×{ex.repRange}</span>
                  <span>Rest {ex.rest}</span>
                  {best&&<span style={{color:C.mid}}>Last best: <strong>{best} lbs</strong></span>}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 80px",gap:6,marginBottom:4}}>
                {["#","Weight","Reps","Effort"].map(h=><div key={h} style={{fontSize:10,color:C.dim}}>{h}</div>)}
              </div>
              {Array.from({length:ex.sets},(_,si)=>{
                const effortLabel=bjjHard&&(ex.efforts[si]||"").includes("Hard")?"Moderate":(ex.efforts[si]||"Moderate");
                return (
                  <div key={si} style={{display:"grid",gridTemplateColumns:"22px 1fr 1fr 80px",gap:6,marginBottom:6}}>
                    <div style={{fontSize:12,color:C.dim,paddingTop:10}}>{si+1}</div>
                    <input type="number" placeholder="lbs" value={(weights[ex.id]||[])[si]||""}
                      onChange={e=>{const arr=[...(weights[ex.id]||Array(ex.sets).fill(""))];arr[si]=e.target.value;setWeights(p=>({...p,[ex.id]:arr}));}}
                      style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
                    <input type="number" placeholder="reps" value={(reps[ex.id]||[])[si]||""}
                      onChange={e=>{const arr=[...(reps[ex.id]||Array(ex.sets).fill(""))];arr[si]=e.target.value;setReps(p=>({...p,[ex.id]:arr}));}}
                      style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 10px",fontSize:13,color:C.text,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
                    <div style={{fontSize:11,fontWeight:600,color:EFFORT_COLOR[effortLabel]||C.dim,lineHeight:1.2,paddingTop:10}}>{effortLabel}</div>
                  </div>
                );
              })}
              {ex.cues&&(
                <div style={{marginTop:8,padding:"8px 10px",background:C.bg,borderRadius:8}}>
                  {ex.cues.map((c,i)=><div key={i} style={{fontSize:11,color:C.dim,marginBottom:1}}>· {c}</div>)}
                </div>
              )}
            </Card>
          );
        })}

        <Card>
          <SectionLabel>Session note</SectionLabel>
          <Inp value={note} onChange={e=>setNote(e.target.value)} placeholder="How'd it feel?" style={{marginBottom:12}}/>
          <Btn variant="primary" onClick={saveSession} style={{width:"100%"}}>Save session</Btn>
        </Card>
      </div>
    );
  }
  return null;
}

// ── Food Tab ──────────────────────────────────────────────────────────────────
function FoodTab({log,setLog,saved,setSaved}){
  const [date,setDate]=useState(todayStr());
  const [name,setName]=useState("");const [cal,setCal]=useState("");
  const [prot,setProt]=useState("");const [carb,setCarb]=useState("");const [fat,setFat]=useState("");
  const [showMgr,setShowMgr]=useState(false);

  const dayLog=log[date]||[];
  const totals=dayLog.reduce((acc,f)=>({cal:acc.cal+f.cal,p:acc.p+f.p,c:acc.c+f.c,f:acc.f+f.f}),{cal:0,p:0,c:0,f:0});
  const addFood=(food)=>{
    const entry=food||{name:name.trim()||"Food",cal:+cal||0,p:+prot||0,c:+carb||0,f:+fat||0};
    setLog(prev=>({...prev,[date]:[...(prev[date]||[]),{...entry,id:Date.now()}]}));
    setName("");setCal("");setProt("");setCarb("");setFat("");
  };
  const calLeft=CAL_GOAL-totals.cal;
  const calPct=Math.min(100,Math.round((totals.cal/CAL_GOAL)*100));
  const reached=totals.cal>=CAL_GOAL;

  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const ds=d.toISOString().split("T")[0];
    return {date:ds,cal:(log[ds]||[]).reduce((s,f)=>s+f.cal,0)};
  });

  // 30-day heatmap: how close to goal each day was
  const last30=Array.from({length:30},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(29-i));
    const ds=d.toISOString().split("T")[0];
    const dayCal=(log[ds]||[]).reduce((s,f)=>s+f.cal,0);
    return {date:ds,cal:dayCal,pct:dayCal/CAL_GOAL};
  });

  // Streak: consecutive days (ending today or yesterday) hitting goal
  const calcStreak=()=>{
    let streak=0;
    let d=new Date();
    while(true){
      const ds=d.toISOString().split("T")[0];
      const dayCal=(log[ds]||[]).reduce((s,f)=>s+f.cal,0);
      if(dayCal>=CAL_GOAL*0.9){ streak++; d.setDate(d.getDate()-1); }
      else break;
    }
    return streak;
  };
  const streak=calcStreak();

  // 30-day average
  const daysWithData=last30.filter(d=>d.cal>0);
  const avg30=daysWithData.length?Math.round(daysWithData.reduce((s,d)=>s+d.cal,0)/daysWithData.length):0;

  const heatColor=(pct)=>{
    if(pct===0) return C.border;
    if(pct<0.7) return "#e8c4ab";
    if(pct<0.9) return "#d9a876";
    if(pct<1.05) return C.green;
    return "#4a6e3d"; // over goal, darker green
  };

  const ChartTip=({active,payload})=>{
    if(!active||!payload?.length) return null;
    return <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12}}>
      <div style={{color:C.dim}}>{fmtDate(payload[0].payload.date)}</div>
      <div style={{fontWeight:700}}>{payload[0].value} kcal</div>
    </div>;
  };

  return (
    <div>
      <Card style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px"}}>
        <span style={{fontSize:11,color:C.dim,textTransform:"uppercase",letterSpacing:1,flexShrink:0}}>Date</span>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)}
          style={{background:"none",border:"none",color:C.text,fontSize:14,fontWeight:600,outline:"none",flex:1,fontFamily:"inherit"}}/>
      </Card>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{fontSize:28,fontWeight:800,letterSpacing:-1}}>{totals.cal}<span style={{fontSize:13,fontWeight:400,color:C.dim,marginLeft:4}}>/ {CAL_GOAL} kcal</span></div>
            <div style={{fontSize:13,color:reached?C.green:C.mid,marginTop:2}}>{reached?"✓ Goal reached":`${calLeft} kcal to go`}</div>
          </div>
          <div style={{fontSize:24,fontWeight:800,color:reached?C.green:C.red}}>{calPct}%</div>
        </div>
        <div style={{background:C.bg,borderRadius:999,height:6,overflow:"hidden",marginBottom:14}}>
          <div style={{width:`${calPct}%`,height:"100%",background:reached?C.green:C.red,borderRadius:999,transition:"width 0.4s"}}/>
        </div>
        {[{label:"Protein",val:totals.p,goal:PROTEIN_GOAL,col:"#c0392b"},{label:"Carbs",val:totals.c,goal:CARB_GOAL,col:"#e67e22"},{label:"Fat",val:totals.f,goal:FAT_GOAL,col:"#2980b9"}].map(m=>(
          <div key={m.label} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
              <span style={{color:C.mid}}>{m.label}</span>
              <span style={{fontWeight:600}}>{m.val}g <span style={{color:C.dim,fontWeight:400}}>/ {m.goal}g</span></span>
            </div>
            <div style={{background:C.bg,borderRadius:999,height:5,overflow:"hidden"}}>
              <div style={{width:`${Math.min(100,Math.round((m.val/m.goal)*100))}%`,height:"100%",background:m.col,borderRadius:999,transition:"width 0.4s"}}/>
            </div>
          </div>
        ))}
      </Card>

      {/* Streak banner */}
      {streak>0 && (
        <Card style={{background:C.oliveLight,borderColor:"#d8ddc4",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:13,color:C.oliveDark,fontWeight:600}}>🔥 {streak} day streak</div>
          <div style={{fontSize:11,color:C.mid}}>Hitting your calorie goal</div>
        </Card>
      )}

      {/* Calorie consistency calendar — navigate any month, any year */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <SectionLabel style={{margin:0}}>Calorie consistency</SectionLabel>
          <span style={{fontSize:11,color:C.dim}}>30-day avg {avg30} kcal</span>
        </div>
        <div style={{fontSize:11,color:C.dim,marginBottom:10}}>Darker = closer to your {CAL_GOAL} kcal goal · browse any month</div>
        <MonthHeatmap
          getDayColor={(d)=>{
            const dayCal=(log[d]||[]).reduce((s,f)=>s+f.cal,0);
            return heatColor(dayCal/CAL_GOAL);
          }}
          getDayTitle={(d)=>{
            const dayCal=(log[d]||[]).reduce((s,f)=>s+f.cal,0);
            return `${fmtDate(d)}: ${dayCal} kcal`;
          }}
          legend={
            <>
              <span style={{fontSize:10,color:C.dim}}>Less</span>
              {[0,0.5,0.8,1,1.1].map((p,i)=>(
                <div key={i} style={{width:10,height:10,borderRadius:3,background:heatColor(p)}}/>
              ))}
              <span style={{fontSize:10,color:C.dim}}>Goal</span>
            </>
          }
        />
      </Card>

      <Card>
        <SectionLabel>7-day calories</SectionLabel>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={last7} margin={{top:4,right:8,left:-24,bottom:0}}>
            <CartesianGrid stroke={C.border} vertical={false}/>
            <XAxis dataKey="date" tickFormatter={fmtDate} tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
            <ReferenceLine y={CAL_GOAL} stroke={C.green} strokeDasharray="3 3"/>
            <Tooltip content={<ChartTip/>}/>
            <Line type="monotone" dataKey="cal" stroke={C.red} strokeWidth={2} dot={{fill:C.red,r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <SectionLabel style={{margin:0}}>My meals</SectionLabel>
          <Btn variant="secondary" small onClick={()=>setShowMgr(true)} style={{padding:"5px 12px"}}>Edit meals</Btn>
        </div>
        {saved.length===0
          ?<div style={{color:C.dim,fontSize:13,textAlign:"center",padding:"10px 0"}}>No saved meals. Tap "Edit meals" to add.</div>
          :<div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {saved.map(m=>(
              <button key={m.id} onClick={()=>addFood(m)} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:20,padding:"7px 13px",cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{m.name}</div>
                <div style={{fontSize:11,color:C.dim}}>{m.cal} kcal · P{m.p}g</div>
              </button>
            ))}
          </div>
        }
      </Card>

      <Card>
        <SectionLabel>Add food</SectionLabel>
        <Inp value={name} onChange={e=>setName(e.target.value)} placeholder="Food name" style={{marginBottom:8}}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:10}}>
          {[["kcal",cal,setCal],["P g",prot,setProt],["C g",carb,setCarb],["F g",fat,setFat]].map(([ph,val,setter])=>(
            <input key={ph} type="number" value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
              style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
          ))}
        </div>
        <Btn variant="primary" onClick={()=>addFood()} style={{width:"100%"}}>Add food</Btn>
      </Card>

      {dayLog.length>0&&(
        <Card>
          <SectionLabel>Today's log</SectionLabel>
          {dayLog.map(f=>(
            <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{f.name}</div>
                <div style={{fontSize:12,color:C.dim}}>{f.cal} kcal{f.p>0?` · P ${f.p}g`:""}{f.c>0?` · C ${f.c}g`:""}{f.f>0?` · F ${f.f}g`:""}</div>
              </div>
              <button onClick={()=>setLog(prev=>({...prev,[date]:(prev[date]||[]).filter(x=>x.id!==f.id)}))}
                style={{background:"none",border:"none",color:C.dim,fontSize:18,cursor:"pointer"}}>×</button>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,fontSize:13,fontWeight:700}}>
            <span style={{color:C.dim}}>Total</span>
            <span>{totals.cal} kcal · P {totals.p}g · C {totals.c}g · F {totals.f}g</span>
          </div>
        </Card>
      )}

      {showMgr&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.2)",zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{background:C.white,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:540,padding:20,maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:16}}>My meals</div>
              <button onClick={()=>setShowMgr(false)} style={{background:"none",border:"none",fontSize:20,color:C.dim,cursor:"pointer"}}>×</button>
            </div>
            {saved.map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <div>
                  <div style={{fontWeight:600,fontSize:14}}>{m.name}</div>
                  <div style={{fontSize:12,color:C.dim}}>{m.cal} kcal · P {m.p}g · C {m.c}g · F {m.f}g</div>
                </div>
                <Btn variant="danger" small onClick={()=>setSaved(p=>p.filter(x=>x.id!==m.id))} style={{padding:"5px 10px"}}>Remove</Btn>
              </div>
            ))}
            <MealAdder onAdd={meal=>{setSaved(p=>[...p,{id:Date.now(),...meal}]);}}/>
          </div>
        </div>
      )}
    </div>
  );
}

function MealAdder({onAdd}){
  const [name,setName]=useState("");const [cal,setCal]=useState("");
  const [p,setP]=useState("");const [c,setC]=useState("");const [f,setF]=useState("");
  const add=()=>{if(!name.trim()||!cal)return;onAdd({name:name.trim(),cal:+cal,p:+p||0,c:+c||0,f:+f||0});setName("");setCal("");setP("");setC("");setF("");};
  return (
    <div style={{marginTop:16}}>
      <SectionLabel>Add new meal</SectionLabel>
      <Inp value={name} onChange={e=>setName(e.target.value)} placeholder="Meal name" style={{marginBottom:8}}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
        {[["kcal",cal,setCal],["P g",p,setP],["C g",c,setC],["F g",f,setF]].map(([ph,val,setter])=>(
          <input key={ph} type="number" value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
            style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"}}/>
        ))}
      </div>
      <Btn variant="primary" onClick={add} style={{width:"100%"}}>Save meal</Btn>
    </div>
  );
}

// ── Weight Tab ────────────────────────────────────────────────────────────────
// ── Stretch Routine Editor ────────────────────────────────────────────────────
function StretchEditor({ stretchProgram, setStretchProgram, onClose }) {
  const [activeKey, setActiveKey] = useState("morning");
  const routine = stretchProgram[activeKey];
  const [addBlockTitle, setAddBlockTitle] = useState("");

  const updateRoutineField = (field, val) => setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], [field]: val } }));

  const addBlock = () => {
    if (!addBlockTitle.trim()) return;
    const newBlock = { id: uid(), title: addBlockTitle.trim(), time: "2 min", items: [] };
    setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: [...p[activeKey].blocks, newBlock] } }));
    setAddBlockTitle("");
  };

  const removeBlock = (blockId) => setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: p[activeKey].blocks.filter(b => b.id !== blockId) } }));

  const updateBlockField = (blockId, field, val) => setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: p[activeKey].blocks.map(b => b.id === blockId ? { ...b, [field]: val } : b) } }));

  const addItem = (blockId, name) => {
    if (!name.trim()) return;
    const newItem = { id: uid(), name: name.trim(), dose: "30s", cues: [] };
    setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: p[activeKey].blocks.map(b => b.id === blockId ? { ...b, items: [...b.items, newItem] } : b) } }));
  };

  const removeItem = (blockId, itemId) => setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: p[activeKey].blocks.map(b => b.id === blockId ? { ...b, items: b.items.filter(i => i.id !== itemId) } : b) } }));

  const updateItemField = (blockId, itemId, field, val) => setStretchProgram(p => ({ ...p, [activeKey]: { ...p[activeKey], blocks: p[activeKey].blocks.map(b => b.id === blockId ? { ...b, items: b.items.map(i => i.id === itemId ? { ...i, [field]: val } : i) } : b) } }));

  const updateCues = (blockId, itemId, cuesText) => {
    const cues = cuesText.split("\n").map(c => c.trim()).filter(Boolean);
    updateItemField(blockId, itemId, "cues", cues);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",zIndex:300,display:"flex",flexDirection:"column"}}>
      <div style={{background:C.bg,flex:1,overflowY:"auto",maxWidth:540,width:"100%",margin:"0 auto"}}>
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 16px 12px",position:"sticky",top:0,zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Btn variant="ghost" onClick={onClose} style={{padding:"4px 0",fontSize:20,color:C.dim}}>←</Btn>
            <div style={{fontWeight:800,fontSize:17,flex:1}}>Edit Stretch Routine</div>
            <Btn variant="primary" small onClick={onClose} style={{padding:"7px 16px",background:C.olive}}>Done</Btn>
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {["morning","night"].map(k=>(
              <button key={k} onClick={()=>setActiveKey(k)} style={{
                flex:1,padding:"7px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"inherit",
                background:activeKey===k?stretchProgram[k].color:"transparent",
                color:activeKey===k?"#fff":C.dim,fontWeight:activeKey===k?700:400,fontSize:13,
              }}>{k==="morning"?"🌅 Morning":"🌙 Night"}</button>
            ))}
          </div>
        </div>

        <div style={{padding:"12px 16px 32px"}}>
          {/* Routine meta */}
          <Card>
            <SectionLabel>Routine info</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>DURATION</div>
                <Inp value={routine.duration} onChange={e=>updateRoutineField("duration",e.target.value)} style={{fontSize:13,padding:"6px 10px"}}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>RULE</div>
                <Inp value={routine.rule} onChange={e=>updateRoutineField("rule",e.target.value)} style={{fontSize:13,padding:"6px 10px"}}/>
              </div>
            </div>
            <div style={{fontSize:9,color:C.dim,marginBottom:3,letterSpacing:1}}>GOAL</div>
            <Inp value={routine.goal} onChange={e=>updateRoutineField("goal",e.target.value)} style={{fontSize:13,padding:"6px 10px"}}/>
          </Card>

          {/* Blocks */}
          {routine.blocks.map(block=>(
            <Card key={block.id}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <Inp value={block.title} onChange={e=>updateBlockField(block.id,"title",e.target.value)} style={{fontSize:13,fontWeight:700,padding:"6px 10px",flex:1}}/>
                <Inp value={block.time} onChange={e=>updateBlockField(block.id,"time",e.target.value)} style={{fontSize:12,padding:"6px 10px",width:70,textAlign:"center"}}/>
                <Btn variant="danger" small onClick={()=>removeBlock(block.id)} style={{padding:"5px 9px"}}>✕</Btn>
              </div>

              {block.items.map(item=>(
                <div key={item.id} style={{background:C.bg,borderRadius:9,padding:10,marginBottom:8}}>
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <Inp value={item.name} onChange={e=>updateItemField(block.id,item.id,"name",e.target.value)} placeholder="Exercise name" style={{fontSize:13,padding:"6px 9px",flex:2}}/>
                    <Inp value={item.dose} onChange={e=>updateItemField(block.id,item.id,"dose",e.target.value)} placeholder="Dose (e.g. 30s)" style={{fontSize:13,padding:"6px 9px",flex:1}}/>
                    <Btn variant="danger" small onClick={()=>removeItem(block.id,item.id)} style={{padding:"5px 9px"}}>✕</Btn>
                  </div>
                  <textarea
                    value={item.cues.join("\n")}
                    onChange={e=>updateCues(block.id,item.id,e.target.value)}
                    placeholder="Cues, one per line (e.g. Glute tight)"
                    rows={2}
                    style={{width:"100%",background:C.white,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 9px",fontSize:12,color:C.text,outline:"none",fontFamily:"inherit",resize:"vertical",boxSizing:"border-box"}}
                  />
                </div>
              ))}

              <AddItemInline onAdd={(name)=>addItem(block.id,name)} />
            </Card>
          ))}

          {/* Add block */}
          <Card style={{background:C.bg,border:`1px dashed ${C.border}`}}>
            <SectionLabel>Add section</SectionLabel>
            <div style={{display:"flex",gap:8}}>
              <Inp value={addBlockTitle} onChange={e=>setAddBlockTitle(e.target.value)} placeholder="Section name (e.g. Ankle Mobility)" />
              <Btn variant="primary" onClick={addBlock} style={{background:C.olive,flexShrink:0,padding:"9px 16px"}}>Add</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddItemInline({ onAdd }) {
  const [val, setVal] = useState("");
  const submit = () => { if(val.trim()){ onAdd(val); setVal(""); } };
  return (
    <div style={{display:"flex",gap:6}}>
      <Inp value={val} onChange={e=>setVal(e.target.value)} placeholder="Add exercise…" style={{fontSize:13,padding:"7px 10px"}}/>
      <Btn variant="secondary" small onClick={submit} style={{flexShrink:0}}>+ Add</Btn>
    </div>
  );
}

// ── Stretch Tab ───────────────────────────────────────────────────────────────
function StretchTab({ stretchLog, setStretchLog, stretchProgram, setStretchProgram }) {
  const [active, setActive] = useState("morning");
  const [checked, setChecked] = useState({});
  const [showEditor, setShowEditor] = useState(false);
  const today = todayStr();
  const routine = stretchProgram[active];

  const allItems = routine.blocks.flatMap(b => b.items.map(it => it.id));
  const doneCount = allItems.filter(id => checked[id]).length;
  const pct = allItems.length ? Math.round((doneCount / allItems.length) * 100) : 0;

  const toggleItem = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const completeRoutine = () => {
    const todayLog = stretchLog[today] || {};
    setStretchLog(p => ({ ...p, [today]: { ...todayLog, [active]: true } }));
    setChecked({});
  };

  const todayDone = stretchLog[today] || {};

  const calcStreak = () => {
    let streak = 0;
    let d = new Date();
    while (true) {
      const ds = d.toISOString().split("T")[0];
      const day = stretchLog[ds];
      if (day && (day.morning || day.night)) { streak++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return streak;
  };
  const streak = calcStreak();

  // Best ever streak
  const calcBestStreak = () => {
    const dates = Object.keys(stretchLog).filter(d => stretchLog[d].morning || stretchLog[d].night).sort();
    if (!dates.length) return 0;
    let best = 1, cur = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]+"T12:00:00");
      const curr = new Date(dates[i]+"T12:00:00");
      const diffDays = Math.round((curr-prev)/86400000);
      if (diffDays === 1) { cur++; best = Math.max(best, cur); }
      else cur = 1;
    }
    return best;
  };
  const bestStreak = calcBestStreak();

  // 3 distinct colors: morning-only, night-only, both
  const stretchDayColor = (d) => {
    const day = stretchLog[d] || {};
    if (day.morning && day.night) return C.bothCol;
    if (day.morning) return C.morningCol;
    if (day.night) return C.nightCol;
    return C.border;
  };

  return (
    <div>
      {/* Header with edit button */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontWeight:800,fontSize:18}}>Stretch Routine</div>
        <Btn variant="secondary" small onClick={()=>setShowEditor(true)} style={{padding:"6px 14px"}}>✎ Edit routine</Btn>
      </div>

      {/* Streak banner */}
      {streak > 0 && (
        <Card style={{ background: C.oliveLight, borderColor: "#d8ddc4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 13, color: C.oliveDark, fontWeight: 600 }}>🔥 {streak} day streak</div>
          <div style={{ fontSize: 11, color: C.mid }}>Best ever: {bestStreak} days</div>
        </Card>
      )}

      {/* Consistency calendar — navigate any month, any year, 3 distinct colors */}
      <Card>
        <SectionLabel>Consistency calendar</SectionLabel>
        <MonthHeatmap
          getDayColor={stretchDayColor}
          getDayTitle={(d)=>{
            const day = stretchLog[d]||{};
            const parts=[];
            if(day.morning) parts.push("🌅 Morning");
            if(day.night) parts.push("🌙 Night");
            return `${fmtDate(d)}: ${parts.length?parts.join(" + "):"Missed"}`;
          }}
          legend={
            <>
              <span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:9,height:9,borderRadius:3,background:C.morningCol,display:"inline-block"}}/>Morning only
              </span>
              <span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:9,height:9,borderRadius:3,background:C.nightCol,display:"inline-block"}}/>Night only
              </span>
              <span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:9,height:9,borderRadius:3,background:C.bothCol,display:"inline-block"}}/>Both
              </span>
              <span style={{fontSize:10,color:C.dim,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:9,height:9,borderRadius:3,background:C.border,display:"inline-block"}}/>Missed
              </span>
            </>
          }
        />
      </Card>

      {/* Today's completion */}
      <Card>
        <SectionLabel>Today</SectionLabel>
        <div style={{ display: "flex", gap: 10 }}>
          {["morning", "night"].map(key => {
            const r = stretchProgram[key];
            const done = todayDone[key];
            return (
              <div key={key} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, textAlign: "center",
                background: done ? r.color + "1c" : C.bg, border: `1px solid ${done ? r.color + "55" : C.border}`,
              }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{key === "morning" ? "🌅" : "🌙"}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: done ? r.color : C.mid }}>{r.label}</div>
                <div style={{ fontSize: 11, color: done ? r.color : C.dim, marginTop: 2 }}>{done ? "✓ Done" : "Not yet"}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Routine selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["morning", "night"].map(key => {
          const r = stretchProgram[key];
          return (
            <button key={key} onClick={() => { setActive(key); setChecked({}); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
              border: `1px solid ${active === key ? r.color : C.border}`,
              background: active === key ? r.color : C.white,
              color: active === key ? "#fff" : C.mid, fontWeight: 600, fontSize: 13,
            }}>
              {key === "morning" ? "🌅" : "🌙"} {r.label}
            </button>
          );
        })}
      </div>

      {/* Routine info */}
      <Card style={{ background: routine.color + "12", borderColor: routine.color + "33" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: routine.color }}>{routine.label}</div>
            <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{routine.duration}</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: routine.color }}>{pct}%</div>
        </div>
        <div style={{ fontSize: 12, color: C.mid, marginBottom: 3 }}><strong>Goal:</strong> {routine.goal}</div>
        <div style={{ fontSize: 12, color: C.mid }}><strong>Rule:</strong> {routine.rule}</div>
        <div style={{ background: C.white, borderRadius: 999, height: 6, overflow: "hidden", marginTop: 10 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: routine.color, borderRadius: 999, transition: "width 0.3s" }} />
        </div>
      </Card>

      {/* Blocks */}
      {routine.blocks.map((block) => (
        <Card key={block.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <SectionLabel style={{ margin: 0 }}>{block.title}</SectionLabel>
            <span style={{ fontSize: 11, color: C.dim }}>{block.time}</span>
          </div>
          {block.items.length === 0 && <div style={{fontSize:12,color:C.dim,fontStyle:"italic"}}>No exercises in this section yet.</div>}
          {block.items.map((item, ii) => {
            const isChecked = checked[item.id];
            return (
              <div key={item.id} style={{ marginBottom: ii === block.items.length - 1 ? 0 : 12 }}>
                <button onClick={() => toggleItem(item.id)} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, width: "100%",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, border: `2px solid ${isChecked ? routine.color : C.border}`,
                    background: isChecked ? routine.color : "transparent", flexShrink: 0, marginTop: 1,
                    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                  }}>
                    {isChecked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isChecked ? C.dim : C.text, textDecoration: isChecked ? "line-through" : "none" }}>
                      {item.name} <span style={{ fontWeight: 400, color: C.dim, fontSize: 12 }}>— {item.dose}</span>
                    </div>
                    {item.cues.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        {item.cues.map((cue, ci) => (
                          <div key={ci} style={{ fontSize: 11, color: C.dim }}>· {cue}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </Card>
      ))}

      <Btn variant="primary" onClick={completeRoutine} style={{ width: "100%", background: routine.color }} disabled={pct < 100 || allItems.length===0}>
        {pct < 100 ? `Complete all items (${doneCount}/${allItems.length})` : `Mark ${routine.label} done ✓`}
      </Btn>

      {showEditor && <StretchEditor stretchProgram={stretchProgram} setStretchProgram={setStretchProgram} onClose={()=>setShowEditor(false)}/>}
    </div>
  );
}


// ── Weight Tab ────────────────────────────────────────────────────────────────
function WeightTab({entries,setEntries}){
  const [wt,setWt]=useState("");const [note,setNote]=useState("");const [date,setDate]=useState(todayStr());
  const [showLog,setShowLog]=useState(false);

  const add=()=>{
    const w=parseFloat(wt);
    if(!w||w<80||w>350) return;
    setEntries([...entries.filter(e=>e.date!==date),{date,weight:w,note:note.trim()}].sort((a,b)=>a.date.localeCompare(b.date)));
    setWt("");setNote("");setDate(todayStr());
  };

  const latest=entries.length?entries[entries.length-1].weight:WEIGHT_START;
  const gained=(latest-WEIGHT_START).toFixed(1);
  const remaining=(WEIGHT_TARGET-latest).toFixed(1);
  const pct=Math.min(100,Math.round(((latest-WEIGHT_START)/(WEIGHT_TARGET-WEIGHT_START))*100));
  const weeks=etaWeeks(entries);
  const chartData=trendLine(entries);

  const ChartTip=({active,payload})=>{
    if(!active||!payload?.length) return null;
    const d=payload[0].payload;
    return <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",fontSize:12}}>
      <div style={{color:C.dim}}>{fmtDate(d.date)}</div>
      <div style={{fontWeight:700}}>{d.weight} lbs</div>
      {d.trend&&<div style={{color:C.red}}>Trend: {d.trend}</div>}
      {d.note&&<div style={{color:C.mid}}>"{d.note}"</div>}
    </div>;
  };

  // Weekly average
  const weeklyAvg=()=>{
    if(entries.length<3) return null;
    const recent=entries.slice(-7);
    return (recent.reduce((s,e)=>s+e.weight,0)/recent.length).toFixed(1);
  };
  const avg=weeklyAvg();

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:12}}>
        {[{label:"Current",value:latest,unit:"lbs",color:C.text},
          {label:"Gained",value:`+${gained}`,unit:"lbs",color:parseFloat(gained)>0?C.green:C.dim},
          {label:"To go",value:remaining,unit:"lbs",color:C.red}].map(({label,value,unit,color})=>(
          <Card key={label} style={{textAlign:"center",marginBottom:0}}>
            <div style={{fontSize:10,color:C.dim,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{label}</div>
            <div style={{fontSize:20,fontWeight:800,color}}>{value}<span style={{fontSize:11,color:C.dim,fontWeight:400,marginLeft:2}}>{unit}</span></div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.dim,marginBottom:8}}>
          <span>Progress to {WEIGHT_TARGET} lbs</span>
          <span style={{fontWeight:700,color:C.text}}>{pct}%</span>
        </div>
        <div style={{background:C.bg,borderRadius:999,height:6,overflow:"hidden",marginBottom:6}}>
          <div style={{width:`${pct}%`,height:"100%",background:C.red,borderRadius:999,transition:"width 0.5s"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.dim}}>
          {weeks&&<span>At your rate → <span style={{fontWeight:600,color:C.text}}>~{weeks} weeks</span> to goal</span>}
          {avg&&<span>7-day avg: <span style={{fontWeight:600,color:C.text}}>{avg} lbs</span></span>}
        </div>
      </Card>

      {chartData.length>0&&(
        <Card>
          <SectionLabel>Weight history</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{top:4,right:12,left:-20,bottom:0}}>
              <CartesianGrid stroke={C.border} vertical={false}/>
              <XAxis dataKey="date" tickFormatter={fmtDate} tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis domain={["auto","auto"]} tick={{fill:C.dim,fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <ReferenceLine y={WEIGHT_TARGET} stroke={C.green} strokeDasharray="4 3"/>
              <Line type="monotone" dataKey="weight" stroke={C.text} strokeWidth={2} dot={{fill:C.text,r:3}} connectNulls/>
              <Line type="monotone" dataKey="trend" stroke={C.red} strokeWidth={1.5} strokeDasharray="4 2" dot={false}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:14,marginTop:6}}>
            <span style={{fontSize:10,color:C.dim}}>── Actual</span>
            <span style={{fontSize:10,color:C.red}}>╌╌ Trend</span>
            <span style={{fontSize:10,color:C.green}}>╌╌ Goal ({WEIGHT_TARGET} lbs)</span>
          </div>
        </Card>
      )}

      <Card>
        <SectionLabel>Log weigh-in</SectionLabel>
        <div style={{fontSize:11,color:C.dim,marginBottom:10}}>Tip: weigh in every morning, same conditions.</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input type="number" value={wt} onChange={e=>setWt(e.target.value)} placeholder="lbs"
            style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:15,outline:"none",width:84,fontFamily:"inherit"}}/>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)}
            style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:14,outline:"none",flex:1,fontFamily:"inherit"}}/>
        </div>
        <Inp value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" style={{marginBottom:10}}/>
        <Btn variant="primary" onClick={add} style={{width:"100%"}}>Add weigh-in</Btn>
      </Card>

      {entries.length>0&&(
        <>
          <Btn variant="secondary" onClick={()=>setShowLog(!showLog)} style={{width:"100%",marginBottom:10}}>
            {showLog?"Hide":"Show"} history ({entries.length} entries)
          </Btn>
          {showLog&&(
            <Card>
              {[...entries].reverse().map(e=>(
                <div key={e.date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div>
                    <span style={{fontWeight:600}}>{e.weight} lbs</span>
                    <span style={{color:C.dim,fontSize:12,marginLeft:10}}>{fmtDate(e.date)}</span>
                    {e.note&&<div style={{color:C.mid,fontSize:12}}>{e.note}</div>}
                  </div>
                  <button onClick={()=>setEntries(entries.filter(x=>x.date!==e.date))}
                    style={{background:"none",border:"none",color:C.dim,fontSize:18,cursor:"pointer"}}>×</button>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const lsGet = (key, fallback) => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } };
const lsSet = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ── Data export / import ──────────────────────────────────────────────────────
function BackupModal({ data, onImport, onClose }) {
  const [importError, setImportError] = useState("");

  const exportData = () => {
    const json = JSON.stringify({ ...data, exportedAt: new Date().toISOString(), version: 1 }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bjj-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        onImport(parsed);
        onClose();
      } catch {
        setImportError("Invalid backup file. Please use a file exported from this app.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.25)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.white,borderRadius:"16px 16px 0 0",width:"100%",maxWidth:540,padding:24,paddingBottom:36}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontWeight:800,fontSize:17}}>Backup & Restore</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:C.dim,cursor:"pointer"}}>×</button>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Export your data</div>
          <div style={{fontSize:13,color:C.mid,marginBottom:12}}>Downloads a JSON file with all your logs, meals, and workout history. Save it to your Files app or Google Drive.</div>
          <Btn variant="primary" onClick={exportData} style={{width:"100%"}}>⬇ Download backup</Btn>
        </div>

        <div style={{height:1,background:C.border,margin:"20px 0"}}/>

        <div>
          <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>Restore from backup</div>
          <div style={{fontSize:13,color:C.mid,marginBottom:12}}>Select a previously exported backup file to restore all your data. This will overwrite your current data.</div>
          {importError && <div style={{fontSize:12,color:C.red,marginBottom:8,padding:"8px 10px",background:"#fff2f1",borderRadius:8}}>{importError}</div>}
          <label style={{display:"block",background:C.bg,border:`1px dashed ${C.border}`,borderRadius:9,padding:"14px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:13,color:C.mid,marginBottom:4}}>📂 Tap to select backup file</div>
            <div style={{fontSize:11,color:C.dim}}>bjj-tracker-backup-*.json</div>
            <input type="file" accept=".json" onChange={handleImport} style={{display:"none"}}/>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [tab,setTab]=useState("home");
  const [weightEntries,setWeightEntries]=useState(()=>lsGet(KEY_WEIGHT,[]));
  const [foodLog,setFoodLog]=useState(()=>lsGet(KEY_FOOD,{}));
  const [savedMeals,setSavedMeals]=useState(()=>lsGet(KEY_SAVED,DEFAULT_SAVED));
  const [gymLog,setGymLog]=useState(()=>lsGet(KEY_GYM,{push:[],pull:[],legs:[]}));
  const [program,setProgram]=useState(()=>lsGet(KEY_PROGRAM,DEFAULT_PROGRAM));
  const [readiness,setReadiness]=useState(()=>lsGet(KEY_READINESS,{}));
  const [stretchLog,setStretchLog]=useState(()=>lsGet(KEY_STRETCH,{}));
  const [stretchProgram,setStretchProgram]=useState(()=>lsGet(KEY_STRETCH_PROGRAM,STRETCH_ROUTINE));
  const [restDays,setRestDays]=useState(()=>lsGet(KEY_RESTDAYS,{}));
  const [showBackup,setShowBackup]=useState(false);

  // Persist to localStorage on every change
  useEffect(()=>lsSet(KEY_WEIGHT,weightEntries),[weightEntries]);
  useEffect(()=>lsSet(KEY_FOOD,foodLog),[foodLog]);
  useEffect(()=>lsSet(KEY_SAVED,savedMeals),[savedMeals]);
  useEffect(()=>lsSet(KEY_GYM,gymLog),[gymLog]);
  useEffect(()=>lsSet(KEY_PROGRAM,program),[program]);
  useEffect(()=>lsSet(KEY_READINESS,readiness),[readiness]);
  useEffect(()=>lsSet(KEY_STRETCH,stretchLog),[stretchLog]);
  useEffect(()=>lsSet(KEY_STRETCH_PROGRAM,stretchProgram),[stretchProgram]);
  useEffect(()=>lsSet(KEY_RESTDAYS,restDays),[restDays]);

  const handleImport = (parsed) => {
    if(parsed.weight)  setWeightEntries(parsed.weight);
    if(parsed.food)    setFoodLog(parsed.food);
    if(parsed.saved)   setSavedMeals(parsed.saved);
    if(parsed.gym)     setGymLog(parsed.gym);
    if(parsed.program) setProgram(parsed.program);
    if(parsed.readiness) setReadiness(parsed.readiness);
    if(parsed.stretch) setStretchLog(parsed.stretch);
    if(parsed.stretchProgram) setStretchProgram(parsed.stretchProgram);
    if(parsed.restDays) setRestDays(parsed.restDays);
  };

  const exportData = {
    weight: weightEntries,
    food: foodLog,
    saved: savedMeals,
    gym: gymLog,
    program,
    readiness,
    stretch: stretchLog,
    stretchProgram,
    restDays,
  };

  const TABS=[["home","Home"],["gym","Gym"],["stretch","Stretch"],["food","Food"],["weight","Weight"]];

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter','SF Pro Text',-apple-system,sans-serif",paddingBottom:52}}>
      <div style={{maxWidth:540,margin:"0 auto",padding:"0 16px"}}>

        {/* Header */}
        <div style={{padding:"22px 0 0",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:3,color:C.dim,textTransform:"uppercase",marginBottom:3}}>BJJ Performance</div>
            <h1 style={{margin:"0 0 1px",fontSize:21,fontWeight:800,letterSpacing:-0.5}}>Tracker</h1>
            <p style={{margin:0,fontSize:11,color:C.dim}}>Push / Pull / Legs · {CAL_GOAL} kcal · 159→170 lbs</p>
          </div>
          <button onClick={()=>setShowBackup(true)}
            title="Backup & Restore"
            style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",fontSize:16,cursor:"pointer",color:C.mid,marginBottom:2}}>
            ☁
          </button>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:18,marginTop:18}}>
          {TABS.map(([key,label])=>(
            <button key={key} onClick={()=>setTab(key)} style={{
              flex:1,padding:"10px 0",background:"none",border:"none",cursor:"pointer",
              fontFamily:"inherit",fontSize:13,fontWeight:tab===key?700:400,
              color:tab===key?C.text:C.dim,
              borderBottom:tab===key?`2px solid ${C.red}`:"2px solid transparent",
              transition:"all 0.15s",
            }}>{label}</button>
          ))}
        </div>

        {tab==="home"  && <DashboardTab weightEntries={weightEntries} gymLog={gymLog} foodLog={foodLog} stretchLog={stretchLog} restDays={restDays} setRestDays={setRestDays} readiness={readiness} setReadiness={setReadiness} program={program}/>}
        {tab==="gym"   && <GymTab gymLog={gymLog} setGymLog={setGymLog} program={program} setProgram={setProgram} restDays={restDays} setRestDays={setRestDays}/>}
        {tab==="stretch" && <StretchTab stretchLog={stretchLog} setStretchLog={setStretchLog} stretchProgram={stretchProgram} setStretchProgram={setStretchProgram}/>}
        {tab==="food"  && <FoodTab log={foodLog} setLog={setFoodLog} saved={savedMeals} setSaved={setSavedMeals}/>}
        {tab==="weight"&& <WeightTab entries={weightEntries} setEntries={setWeightEntries}/>}

        {showBackup && (
          <BackupModal
            data={exportData}
            onImport={handleImport}
            onClose={()=>setShowBackup(false)}
          />
        )}
      </div>
    </div>
  );
}
