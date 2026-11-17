/* Advanced Squad STX — event configuration and rubrics.
   This one file drives both the server (which sheets it will accept) and the
   grading console (what evaluators see).

   TASKS are the graded tasks. Each is scored, saved, ranked and reported on its own.
   GRADE_TABS only groups tasks onto the evaluator's grading tabs.

   TASK FORMAT
   {
     id:    "ambush",                 lowercase letters/digits, unique, never "tlp"
     label: "Ambush",                 short name for the rankings column
     full:  "Conduct an Ambush",
     weight: 1,                       optional relative share of the non-TLP weight (default 1)
     metric: {label:"Total time on the lane", unit:"min"},
                                      makes the task timed: a time in minutes is required
                                      to save it. Omit or set null for an untimed task.
     rubrics: [
       { id:"ambush", title:"Conduct an Ambush — Squad", sub:"T&EO 07-SQD-xxxx · ATP 3-21.8",
         teo:true,                    true = show the T&EO T/P/U matrix rating
         groups:null,                 or {pl:"Plan", pr:"Prepare", ...} with g:"pl" on items
         items:[
           {id:"b1", num:"1", crit:true, name:"Measure name", d:"Standard / description."},
           {id:"b2", num:"2", ldr:true,  name:"Leader measure", d:"..."}
         ]}
     ]
   }
   Every measure on every sheet is rated GO or NO-GO; a task's GO % is the share of its
   measures rated GO.

   FINAL SCORE (lowest wins) = total minutes on the timed tasks x (1 + NO-GO share),
   where NO-GO share = 1 - weighted GO %. TLP carries TLP_WEIGHT of the GO %; the other
   tasks split the rest by their weight. */
(function (root, factory) {
  var cfg = factory();
  if (typeof module === "object" && module.exports) module.exports = cfg;
  else root.STX_CONFIG = cfg;
})(this, function () {
  "use strict";

  var SQUADS = ["1", "2", "3", "4", "5", "6", "7"];
  var SQUAD_NAMES = {
    "1": "DOG1 / 1 SQD", "2": "DOG1 / 2 SQD",
    "3": "DOG2 / 1 SQD", "4": "DOG2 / 2 SQD",
    "5": "DOG3 / 1 SQD", "6": "DOG3 / 2 SQD",
    "7": "MORTAR"
  };

  /* TLP rubric carried over from the Squad LFX scorecard:
     Squad Leader OPORD Evaluation Sheet, D Co 2-506 IN.
     24 GO/NO-GO measures, 8 critical. */
  var TLP_GROUPS = {
    g1: "Section 1 — TLP / WARNORD (before the order)",
    p1: "Paragraph 1 — Situation",
    p2: "Paragraph 2 — Mission",
    p3: "Paragraph 3 — Execution",
    p4: "Paragraph 4 — Sustainment",
    p5: "Paragraph 5 — Command & Signal",
    dc: "Delivery and Confirmation"
  };
  var TLP_ITEMS = [
    {id:"m1",  g:"g1", crit:true,  name:"WARNORD issued promptly",      d:"Includes type of operation, general location, initial timeline, and preparation instructions. Squad starts preparing before the full order — this is the point of the WARNORD."},
    {id:"m2",  g:"g1", crit:false, name:"Backward-planned timeline",    d:"Built using the 1/3–2/3 rule (SL uses 1/3 of available time; teams get 2/3)."},
    {id:"m3",  g:"g1", crit:false, name:"Movement, recon & coordination initiated", d:"Movement, reconnaissance (map, SUAS, or leader's recon), and coordination as required while planning continued."},
    {id:"m4",  g:"p1", crit:false, name:"Terrain briefed using OAKOC",  d:"At least one 'so what' per letter — how it affects US and how it affects the ENEMY."},
    {id:"m5",  g:"p1", crit:false, name:"Weather effects",              d:"Visibility, temperature, precipitation, illumination — and what each means for the mission."},
    {id:"m6",  g:"p1", crit:true,  name:"Enemy briefed",                d:"Composition (who, how many, key weapons), disposition (where), capabilities, and most likely COA — including expected actions on our approach and reaction to contact."},
    {id:"m7",  g:"p1", crit:false, name:"Friendly forces",              d:"Platoon mission and intent (one up), company mission (two up), and adjacent units left/right."},
    {id:"m8",  g:"p2", crit:true,  name:"Mission stated twice, all 5 Ws", d:"WHO, WHAT, WHEN, WHERE, WHY with a doctrinal task verb (e.g., seize, destroy, clear)."},
    {id:"m9",  g:"p3", crit:false, name:"Squad leader's intent",        d:"Expanded purpose, key tasks, and end state (friendly, enemy, terrain)."},
    {id:"m10", g:"p3", crit:true,  name:"Concept masses combat power",  d:"Identifies the main effort and masses combat power at the decisive point — where and why the squad wins the fight."},
    {id:"m11", g:"p3", crit:true,  name:"Scheme of maneuver, start to finish", d:"Briefed sequentially with no gaps: AA → LD → route → PLD/assault position → actions on the objective → LOA → consolidation and reorganization."},
    {id:"m12", g:"p3", crit:false, name:"Actions on the objective in detail", d:"SBF emplacement and fires, breach (if required), assault, shift/lift fire triggers, and clearing the objective to the LOA."},
    {id:"m13", g:"p3", crit:false, name:"Contingencies",                d:"Actions on contact, danger areas, compromise, and indirect fire support available (targets and who calls for fire)."},
    {id:"m14", g:"p3", crit:false, name:"Team tasks and purposes",      d:"Each team (ATM, BTM, attachments) assigned a task AND purpose that supports the squad mission."},
    {id:"m15", g:"p3", crit:false, name:"Coordinating instructions",    d:"Timeline, PIR/information requirements, ROE, and PPE/MOPP posture."},
    {id:"m16", g:"p4", crit:false, name:"Load-out and resupply",        d:"Class I (rations/water), Class V (ammunition by weapon), and Class VIII (medical)."},
    {id:"m17", g:"p4", crit:true,  name:"CASEVAC plan",                 d:"CCP location(s), aid and litter teams, evacuation method, and MEDEVAC request procedure."},
    {id:"m18", g:"p5", crit:false, name:"Succession of command",        d:"Briefed at least two deep."},
    {id:"m19", g:"p5", crit:true,  name:"Shift / lift / assault signals", d:"Primary and alternate (visual, radio, audible). On a squad attack a missed shift/lift signal is a fratricide risk — must-pass."},
    {id:"m20", g:"p5", crit:false, name:"PACE plan and key leader locations", d:"PACE to higher and key leader locations by phase (SL, TLs)."},
    {id:"m21", g:"dc", crit:false, name:"Terrain model or sketch used", d:"Pointed to graphics while briefing."},
    {id:"m22", g:"dc", crit:false, name:"Confident, plain-language delivery", d:"In sequence, without reading the order word-for-word."},
    {id:"m23", g:"dc", crit:true,  name:"Confirmation briefs with team leaders", d:"Conducted immediately after the order to verify they understand the mission, intent, and their tasks."},
    {id:"m24", g:"dc", crit:false, name:"Time standard met",            d:"OPORD briefed in 45 minutes or less; rehearsal and inspection schedule announced."}
  ];

  var TEO_GROUPS = {pl: "Plan", pr: "Prepare", ex: "Execute", as: "Assess"};

  /* Area or Zone Reconnaissance, individual task 171-123-1301 (ATP 3-20.98).
     Only the performance steps selected for this STX are graded: 1.f, 3.a, 3.c, 3.d,
     3.e(10), 8, 9. The task carries no critical/leader marks, so no T/P/U is shown. */
  var RECON_RUBRIC = {
    id: "recon", title: "Conduct an Area or Zone Reconnaissance", sub: "Task 171-123-1301 · ATP 3-20.98 · selected performance steps",
    teo: false, groups: null,
    items: [
      {id:"r1", num:"1f",     name:"Operational security measures in the order", d:"The OPORD or FRAGORD issued for the reconnaissance includes operational security measures."},
      {id:"r2", num:"3a",     name:"Controls maneuver of the teams",            d:"While conducting the reconnaissance, the leader controls the maneuver of the sections, squads, or teams."},
      {id:"r3", num:"3c",     name:"Submits reports to higher headquarters",    d:"Reports are submitted to higher headquarters during the reconnaissance."},
      {id:"r4", num:"3d",     name:"Maintains command of the element",          d:"The leader maintains command of the element throughout the reconnaissance."},
      {id:"r5", num:"3e(10)", name:"Finds and reports all enemy forces",        d:"Finds all enemy forces within the area or zone and reports them to higher headquarters."},
      {id:"r6", num:"8",      name:"Evaluates the information collected",       d:"Evaluates the information collected from the area or zone reconnaissance."},
      {id:"r7", num:"9",      name:"Reports information collected",             d:"Reports the information collected to higher headquarters."}
    ]
  };

  /* Enhanced LACE report, graded by the DOG CMD grader — one GO/NO-GO measure per line.
     Unit reporting format, not a T&EO, so no critical/leader marks and no T/P/U.
     The four base LACE lines are below; add the unit's "enhanced" lines as further items. */
  var REPORT_RUBRIC = {
    id: "report", title: "Enhanced LACE Report", sub: "Squad status report to higher · unit SOP",
    teo: false, groups: null,
    items: [
      {id:"c1", num:"L", name:"Liquid",     d:"Reports the squad's water status."},
      {id:"c2", num:"A", name:"Ammunition", d:"Reports the squad's ammunition status."},
      {id:"c3", num:"C", name:"Casualties", d:"Reports the squad's casualty status."},
      {id:"c4", num:"E", name:"Equipment",  d:"Reports the squad's equipment status."}
    ]
  };

  /* Conduct an Attack, Squad. T&EO 07-SQD-1092 (effective 12 Sep 2025), ATP 3-21.8.
     Only the performance steps selected for this STX are graded: 1, 2, 2.b(2), 2.b(3),
     2.b(9), 2.b(10), 6.c, 6.d, 6.d(2), 6.d(4), 6.d(5), 6.e(4), 6.e(5), 6.e(6), 6.e(7),
     6.e(10), 8. Sub-measures of a critical (+) parent step carry the critical mark.
     No leader (*) steps are among those selected. */
  var ATTACK_RUBRIC = {
    id: "attack", title: "Conduct an Attack — Squad", sub: "T&EO 07-SQD-1092 · ATP 3-21.8 · selected performance steps",
    teo: true, groups: TEO_GROUPS,
    items: [
      {id:"a1",  g:"pl", num:"1",                  name:"Situational understanding",        d:"Gains situational understanding through intelligence products and graphics (threat template, likely and most dangerous COAs, order of battle, terrain and weather products); maintains awareness through R&S, battle tracking, and friendly/threat graphics — spot reports, SUAS, sensors, information collection."},
      {id:"a2",  g:"pl", num:"2",       crit:true, name:"Receives the mission and begins TLP", d:"The squad leader receives the mission to conduct an attack and begins troop leading procedures: issues a warning order (general location, initial task organization and timeline, reconnaissance and movement to initiate, planning and preparation instructions, information requirements) and conducts mission analysis focused on METT-TC(I), then develops the plan."},
      {id:"a3",  g:"pl", num:"2b(2)",   crit:true, name:"Employment of weapons systems",    d:"Plans the employment of available weapons systems."},
      {id:"a4",  g:"pl", num:"2b(3)",   crit:true, name:"Scheme of maneuver",               d:"Develops a scheme of maneuver that destroys or defeats enemy forces, seizes and secures terrain, or both: maximizes restrictive terrain, infiltration to positions of advantage, and attack from unanticipated directions; maximizes movement techniques to position combat power in positions of advantage; identifies required mobility tasks throughout the operation."},
      {id:"a5",  g:"pl", num:"2b(9)",   crit:true, name:"Enemy and terrain information in the plan", d:"Incorporates enemy and terrain information into plans that may require the attacking unit to change its combat formation, direction of movement, and movement technique(s)."},
      {id:"a6",  g:"pl", num:"2b(10)",  crit:true, name:"Graphic control measures",         d:"Develops graphic control measures — limit of advance or forward boundary, tentative rally points, phase lines, contact points, trigger lines, checkpoints — for movement to the objective, actions on the objective, direct fires, and fire support throughout the operation."},
      {id:"a7",  g:"ex", num:"6c",      crit:true, name:"Leader's reconnaissance",          d:"The squad leader conducts a leader's reconnaissance to pinpoint the objective, identify security, assault, and support-by-fire positions, and locate any obstacles that may affect the plan. May be combined with reconnaissance in the planning phase to preserve tempo."},
      {id:"a8",  g:"ex", num:"6d",      crit:true, name:"Fixes the enemy",                  d:"The squad conducts actions at the PLD or assault position to prevent repositioning or reinforcement of the enemy."},
      {id:"a9",  g:"ex", num:"6d(2)",   crit:true, name:"SBF occupation synchronized with maneuver", d:"The squad leader synchronizes the occupation of the support-by-fire positions with the maneuver of the supported attacking unit to limit the vulnerability of the forces occupying them. The squad halts in the assault position only to synchronize friendly forces."},
      {id:"a10", g:"ex", num:"6d(4)",   crit:true, name:"Support force observes suppressive fires", d:"The support force maintains visual observation of suppressive fires just forward of the breach and assault forces."},
      {id:"a11", g:"ex", num:"6d(5)",   crit:true, name:"Support force shifts fires",       d:"The support force shifts fires for preparation of the breach force and the follow-on assault force."},
      {id:"a12", g:"ex", num:"6e(4)",   crit:true, name:"Maneuvers to destroy the enemy and clear objectives", d:"Maneuvers to quickly penetrate or destroy enemy forces and clear assigned objectives."},
      {id:"a13", g:"ex", num:"6e(5)",   crit:true, name:"Fires isolate the objective",      d:"Synchronizes fires to isolate the objective so the enemy cannot reinforce or conduct a counterattack."},
      {id:"a14", g:"ex", num:"6e(6)",   crit:true, name:"Fires maintain momentum",          d:"Synchronizes fires in front of the assaulting force to maintain momentum."},
      {id:"a15", g:"ex", num:"6e(7)",   crit:true, name:"Weapons positioned to sustain suppression", d:"Positions or repositions weapons systems, as necessary, to maximize suppressive fire effectiveness in support of the assault element as it moves across the objective."},
      {id:"a16", g:"ex", num:"6e(10)",  crit:true, name:"Establishes the limit of advance", d:"Establishes the limit of advance."},
      {id:"a17", g:"as", num:"8",                  name:"Consolidates and reorganizes",     d:"Consolidation: eliminates enemy resistance on the objective; 360-degree security (key terrain, observation posts, security patrols); assists passage of follow-on forces if required; improves security (EA development, direct-fire planning, FPFs, registered targets, battle position preparation); protects the obstacle reduction effort; secures EPWs and detainees; prepares for counterattack. Reorganization: medical treatment and CASEVAC/MEDEVAC; treats, evacuates, and processes EPWs and detainees; cross-levels personnel and loads; resupply and rearm; redistributes ammunition; maintenance; improves battle positions."}
    ]
  };

  /* Conduct an Ambush, Squad. T&EO 07-SQD-9010 (effective 06 Mar 2025), ATP 3-21.8.
     Only the performance steps selected for this STX are graded: 5.g(8)(a-c), 5.g(9),
     5.g(12), 5.h, 6.a, 6.b, 6.e, 7.e, 7.f(1), 7.f(3), 7.g(1-2), 7.g(4), 9.a(2)(a),
     9.b(5-7), 10. The planning steps (step 2) were removed from this sheet.
     Each selected step is its own measure. Sub-measures of a critical (+) or leader (*)
     parent step carry the parent's mark. */
  var AMBUSH_RUBRIC = {
    id: "ambush", title: "Conduct an Ambush — Squad", sub: "T&EO 07-SQD-9010 · ATP 3-21.8 · selected performance steps",
    teo: true, groups: TEO_GROUPS,
    items: [
      {id:"b18", g:"pr", num:"5g(8)(a)",  ldr:true,  name:"Assault position selected",         d:"On the leader's reconnaissance, selects an assault position that provides cover and concealment; allows observation and fire into the kill zone; is close enough for rapid assault into the kill zone; and is protected by a natural or manmade obstacle if the enemy is mounted or armored."},
      {id:"b19", g:"pr", num:"5g(8)(b)",  ldr:true,  name:"Support position selected",         d:"Selects a support position that permits observation and effective fires into the kill zone and provides cover and concealment."},
      {id:"b20", g:"pr", num:"5g(8)(c)",  ldr:true,  name:"Security position selected",        d:"Selects security positions that are covered and concealed; provide early warning of enemy approach into the kill zone or toward any element; and allow elements to secure the squad, prevent escape from the kill zone, and prevent reinforcement of the enemy in it."},
      {id:"b21", g:"pr", num:"5g(9)",     ldr:true,  name:"Routes selected",                   d:"Selects primary and alternate covered and concealed routes to and from all positions and the ORP."},
      {id:"b22", g:"pr", num:"5g(12)",    ldr:true,  name:"Reconnaissance information disseminated", d:"Disseminates information from the reconnaissance, if contact was not made."},
      {id:"b23", g:"pr", num:"5h",        ldr:true,  name:"Plan adjusted",                     d:"The squad leader adjusts the plan based on updated intelligence and the reconnaissance: updates the enemy situation; allows time for subordinate leaders to disseminate changes; assigns security, support, and assault positions; designates withdrawal routes back to the ORP; designates control measures at the site (kill zone, limit of advance, assault-by-fire and support-by-fire positions, assault position, target registration point); designates the ambush formation; designates an ORP security element if the squad will return there."},
      {id:"b24", g:"ex", num:"6a",        crit:true, name:"Security force occupies its positions", d:"Departs the ORP and moves tactically to the security positions; early warning devices positioned first; secures the flanks and provides detection and early warning; covers dismounted avenues of approach into the kill zone; noise and light discipline; sectors of observation and fire with sector stakes; claymores, AT mines, and obstacles as the situation dictates; concealment checked from the enemy side if possible; teams positioned for control; informs and maintains communications with the squad leader."},
      {id:"b25", g:"ex", num:"6b",        crit:true, name:"Support and assault forces occupy their positions", d:"Once the security forces are in position, or on the squad leader's order: move tactically to and occupy positions; designate individual sectors of observation and fire and emplace sector stakes to prevent fratricide; emplace claymores, AT mines, obstacles, and early warning devices as the situation dictates; check positions from the enemy side to verify concealment, if possible (leaders do not enter the kill zone)."},
      {id:"b26", g:"ex", num:"6e",        crit:true, name:"Operational security and deception", d:"The squad maintains operational security and executes active deception measures to deceive the enemy as to the ambush location and the strength of the attack."},
      {id:"b27", g:"ex", num:"7e",        crit:true, name:"Shifts, lifts, or ceases fires",    d:"Orders shifting, lifting, or ceasing of all supporting fires using voice communications or other tactical means, if the assault force clears the kill zone."},
      {id:"b28", g:"ex", num:"7f(1)",     crit:true, name:"Kills or captures enemy forces",    d:"On order, the assault force clears the kill zone before the enemy can react effectively and kills or captures enemy forces."},
      {id:"b29", g:"ex", num:"7f(3)",     crit:true, name:"Clears through; security beyond the kill zone", d:"The assault force clears through and establishes local security beyond the kill zone."},
      {id:"b30", g:"ex", num:"7g(1)",     crit:true, name:"Support covers the assault force's withdrawal", d:"Uses the support position to cover the withdrawal of the assault force from the kill zone."},
      {id:"b31", g:"ex", num:"7g(2)",     crit:true, name:"Security covers the support force's withdrawal", d:"Uses the security team to cover the withdrawal of the support force from the ambush site."},
      {id:"b32", g:"ex", num:"7g(4)",     crit:true, name:"All elements withdraw to the ORP",  d:"Ensures all squad elements withdraw to the ORP, if planned."},
      {id:"b33", g:"as", num:"9a(2)(a)",             name:"Secures key terrain",               d:"In consolidation, establishes 360-degree security by securing key terrain."},
      {id:"b34", g:"as", num:"9b(5)",                name:"Resupply",                          d:"Conducts resupply operations, to include rearming and refueling."},
      {id:"b35", g:"as", num:"9b(6)",                name:"Redistributes ammunition and supplies", d:"Redistributes ammunition and other supplies."},
      {id:"b36", g:"as", num:"9b(7)",                name:"Maintenance",                       d:"Conducts maintenance, as needed."},
      {id:"b37", g:"as", num:"10",        ldr:true,  name:"Reports status",                    d:"The squad leader reports the squad's status and continues operations according to the order and the commander's guidance."}
    ]
  };

  /* Tactical lanes — see LANE FORMAT above. Set metric:null on a lane to grade it
     on the rubric alone. */
  /* Conduct a Linkup. T&EO 07-PLT-1063 (effective 16 Sep 2024), ATP 3-21.8.
     A platoon task graded here at squad level, so "platoon leader" reads as the leader of
     the element being evaluated. Only the performance steps selected for this STX are
     graded: 2.b(1)(a), 2.b(2), 2.b(3), 2.b(4)(b-k), 2.b(8). Each selected step is its own
     measure. All sit under critical (+) step 2, so each carries the critical mark. */
  var LINKUP_RUBRIC = {
    id: "linkup", title: "Conduct a Linkup", sub: "T&EO 07-PLT-1063 · ATP 3-21.8 · selected performance steps, applied at squad level",
    teo: true, groups: null,
    items: [
      {id:"l1",  num:"2b(1)(a)", crit:true, name:"Friendly locations report",          d:"Mission analysis: receives an updated report showing the location of forward and adjacent friendly elements."},
      {id:"l2",  num:"2b(2)",    crit:true, name:"Plans and conducts reconnaissance",  d:"Coordinates the location and criteria for linkup with HQ; uses all assigned or available reconnaissance assets (UAS, robotics, sensors, other equipment); identifies primary and alternate linkup points."},
      {id:"l3",  num:"2b(3)",    crit:true, name:"Linkup plan coordinated with the linkup elements", d:"Covers enemy contact before, during, and after linkup; length of time to wait at the linkup point; actions if some elements fail to link up; alternate linkup points and rally points; criteria for linkup point occupation, such as time or arrival of a specified percentage of the element."},
      {id:"l4",  num:"2b(4)(b)", crit:true, name:"Friendly elements or personnel",     d:"Elements exchange the number and types of friendly elements or personnel."},
      {id:"l5",  num:"2b(4)(c)", crit:true, name:"Disposition of stationary forces",   d:"Elements exchange the disposition of stationary forces, if either element is stationary."},
      {id:"l6",  num:"2b(4)(d)", crit:true, name:"Routes",                             d:"Elements exchange the routes to the linkup and rally points."},
      {id:"l7",  num:"2b(4)(e)", crit:true, name:"Fire control measures",              d:"Elements exchange fire control measures."},
      {id:"l8",  num:"2b(4)(f)", crit:true, name:"Recognition signals",                d:"Elements exchange near and far recognition signals."},
      {id:"l9",  num:"2b(4)(g)", crit:true, name:"Communications information",         d:"Elements exchange communications information."},
      {id:"l10", num:"2b(4)(h)", crit:true, name:"Combat support coverage",            d:"Elements exchange combat support coverage."},
      {id:"l11", num:"2b(4)(i)", crit:true, name:"Sustainment",                        d:"Elements exchange sustainment responsibilities and procedures."},
      {id:"l12", num:"2b(4)(j)", crit:true, name:"Final linkup point and rally point", d:"Elements exchange the final location of the linkup point and rally point."},
      {id:"l13", num:"2b(4)(k)", crit:true, name:"Special coordination",               d:"Elements exchange any special coordination, such as maneuver instructions or requests for medical support."},
      {id:"l14", num:"2b(8)",    crit:true, name:"Linkup point occupation criteria",   d:"Determines the criteria for linkup point occupation: far recognition signal by voice or digital communications; near recognition by visual or voice signals; movement to the linkup point; local security at the linkup point; strict fire control measures to prevent fratricide; additional coordination and linkup activities as necessary."}
    ]
  };

  /* Timed tasks: total minutes on the lane, required to save the sheet. */
  var TIME_METRIC = {label:"Total time on the lane", unit:"min"};
  var TASKS = [
    {id:"linkup", label:"Linkup", full:"Conduct a Linkup",                    metric:null,        rubrics:[LINKUP_RUBRIC]},
    {id:"recon",  label:"Recon",  full:"Conduct a Zone Reconnaissance",       metric:TIME_METRIC, rubrics:[RECON_RUBRIC]},
    {id:"attack", label:"Attack", full:"Conduct an Attack",                   metric:TIME_METRIC, rubrics:[ATTACK_RUBRIC]},
    {id:"ambush", label:"Ambush", full:"Conduct an Ambush",                   metric:TIME_METRIC, rubrics:[AMBUSH_RUBRIC]},
    {id:"report", label:"LACE",   full:"Enhanced LACE Report",                metric:null,        rubrics:[REPORT_RUBRIC]}
  ];

  /* The evaluator's grading tabs. Every task id (and "tlp") appears on exactly one tab. */
  var GRADE_TABS = [
    {id:"tab1", label:"DOG1 Grader",    tag:"Recon · Linkup · TLP", tasks:["recon", "linkup", "tlp"]},
    {id:"tab2", label:"DOG3 Grader",    tag:"Attack · Ambush",      tasks:["attack", "ambush"]},
    {id:"tab3", label:"DOG CMD Grader", tag:"LACE Report",          tasks:["report"]}
  ];

  /* Strict time parser shared by the console and the server. Accepts only a plain positive
     number of minutes ("47" or "47.5"). Returns null for anything else — "47:30", "47,5",
     "1e3" and "30 min" are refused rather than silently read as a different number. */
  function parseMinutes(v) {
    if (typeof v === "number") v = String(v);
    if (typeof v !== "string") return null;
    v = v.trim();
    if (!/^\d{1,5}(\.\d{1,3})?$/.test(v)) return null;
    var n = parseFloat(v);
    return n > 0 ? n : null;
  }

  return {
    parseMinutes: parseMinutes,
    TITLE: "Advanced Squad STX Scorecard",
    UNIT: "D Co, 2-506 IN",
    SQUADS: SQUADS,
    SQUAD_NAMES: SQUAD_NAMES,
    TLP: {
      label: "TLP", full: "Squad Leader OPORD / TLP",
      title: "Squad Leader OPORD Evaluation", sub: "TC 3-21.76 · ATP 3-21.8",
      note: "Squad Leader OPORD Evaluation — D Co, 2-506 IN (White Currahee). Refs: TC 3-21.76, ATP 3-21.8.",
      items: TLP_ITEMS, groups: TLP_GROUPS,
      tThreshold: 20 /* T: all criticals GO and >= 20 of 24 GO */
    },
    TASKS: TASKS,
    GRADE_TABS: GRADE_TABS,
    TLP_WEIGHT: 0.20    /* TLP share of the weighted GO %; the other tasks split the rest by their weight */
  };
});
