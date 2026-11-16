/* Advanced Squad STX — event configuration and rubrics.
   This one file drives both the server (which sheets it will accept) and the
   grading console (what evaluators see). To add a lane, append an entry to LANES.

   LANE FORMAT
   {
     id:    "lane1",                  lowercase letters/digits, unique, never "tlp"
     label: "Ambush",                 short name for buttons and the rankings column
     tag:   "lane 1",                 small caption under the button
     full:  "Lane 1 — Conduct an Ambush",
     weight: 1,                       optional relative share of the lane weight (default 1)
     metric: {label:"Time to complete", unit:"min", better:"low"},
                                      optional objective number; better:"low" or "high".
                                      Omit or set null for a rubric-only lane.
     rubrics: [
       { id:"ambush", title:"Conduct an Ambush — Squad", sub:"T&EO 07-SQD-xxxx · ATP 3-21.8",
         teo:true,                    true = show the T&EO T/P/U matrix rating
         groups:null,                 or {pl:"Plan", pr:"Prepare", ...} with g:"pl" on items
         items:[
           {id:"b1", num:"1", crit:true, name:"Measure name", d:"Standard / description."},
           {id:"b2", num:"2", ldr:true,  name:"Leader measure", d:"..."},
           {id:"b3", num:"3", checksOnly:true, name:"Checklist measure", d:"...",
             checks:[{id:"b3c1", l:"Check one"}, {id:"b3c2", l:"Check two"}]}
         ]}
     ]
   }
   Item ids must be unique within a lane. Lane measures are scored 0-3
   (N/O, Not met, Met, Exceeded); checks are 1 point each. */
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
    "7": "SAPPER"
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

  /* Lane 1 — Area or Zone Reconnaissance, individual task 171-123-1301 (ATP 3-20.98).
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

  /* Report Tactical Information, T&EO 34-CO-0010 (ATP 3-55.4, FM 6-99). Graded on the recon lane.
     Only step 3 (the SALUTE report to higher) is graded, one measure per line 3.a-3.g.
     Step 3 is a critical (+) step, so each line carries the critical mark. */
  var REPORT_RUBRIC = {
    id: "report", title: "Report Tactical Information — SALUTE", sub: "T&EO 34-CO-0010 step 3 · ATP 3-55.4 · FM 6-99",
    teo: true, groups: null,
    items: [
      {id:"t3a", num:"3a", crit:true, name:"Size",      d:"Expressed as a quantity or echelon."},
      {id:"t3b", num:"3b", crit:true, name:"Activity",  d:"What is happening, as a concise bullet statement."},
      {id:"t3c", num:"3c", crit:true, name:"Location",  d:"An 8- or 10-digit grid coordinate, or an address if appropriate."},
      {id:"t3d", num:"3d", crit:true, name:"Unit",      d:"Who is performing the activity — designates the unit or identifies a group or individual."},
      {id:"t3e", num:"3e", crit:true, name:"Time",      d:"When the activity was observed, or when it was initiated if ongoing."},
      {id:"t3f", num:"3f", crit:true, name:"Equipment", d:"Describes or identifies any equipment."},
      {id:"t3g", num:"3g", crit:true, name:"Remarks",   d:"Any other pertinent or time-sensitive information that must be passed."}
    ]
  };

  /* Lane 2 — Conduct an Attack, Squad. T&EO 07-SQD-1092 (effective 12 Sep 2025), ATP 3-21.8.
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

  /* Lane 3 — Conduct an Ambush, Squad. T&EO 07-SQD-9010 (effective 06 Mar 2025), ATP 3-21.8. */
  var AMBUSH_RUBRIC = {
    id: "ambush", title: "Conduct an Ambush — Squad", sub: "T&EO 07-SQD-9010 · ATP 3-21.8",
    teo: true, groups: TEO_GROUPS,
    items: [
      {id:"b1",  g:"pl", num:"1",                       name:"Situational understanding",         d:"Gains situational understanding through intelligence products and graphics (threat template, likely and most dangerous COAs, order of battle, terrain and weather products); maintains awareness through R&S, battle tracking, and friendly/threat graphics — spot reports, SUAS, sensors, information collection."},
      {id:"b2",  g:"pl", num:"2a",         crit:true,   name:"WARNORD issued",                    d:"General location of the ambush, initial task organization, initial timeline, reconnaissance and movement to initiate, planning and preparation instructions including the planning timeline, information requirements."},
      {id:"b3",  g:"pl", num:"2b(1-2)",    crit:true,   name:"Mission analysis & reconnaissance plan", d:"Determines the anticipated enemy's type and size, organization or formation, route and direction of movement, timing along the route, and weapons and equipment; identifies most likely and most dangerous COAs and information requirements; R&S plan answers them using all available assets; identifies tentative ambush position, ORP, and assault, support, and security positions that cover the entire kill zone, use obstacles (claymores, AT mines) to hold the enemy in it, and protect the assault and support forces."},
      {id:"b4",  g:"pl", num:"2b(3-6)",    crit:true,   name:"Scheme of maneuver & organization of forces", d:"Selects a point ambush or antiarmor ambush; organizes assault, support, and security forces; coordinates enabling assets with higher HQ as required; plans employment of UAS, robotics, sensors, and other equipment."},
      {id:"b5",  g:"pl", num:"2b(7)a-c",   crit:true,   name:"Ambush site, kill zone, positions & formation", d:"Refines the plan from reconnaissance. Ambush site: fields of fire into the kill zone, cover and concealment, protective obstacles, covered and concealed withdrawal route, hard to flank. Kill zone: where the enemy is likely to enter, natural obstacles, large enough to observe and engage the expected force. Security positions: do not mask fires, give timely warning, can support by fire. ORP: easy to find, covered and concealed, off natural lines of drift, defendable for short periods. Formation (linear, L-shaped, or antiarmor) fits the scheme."},
      {id:"b6",  g:"pl", num:"2b(7)d-l",   crit:true,   name:"Initiation, timing, withdrawal & contingencies", d:"Obstacles, claymores, and AT mines keep the enemy in the kill zone; entire kill zone covered by direct and indirect fires; initiation criteria; engagement techniques if different from SOP; rotation plan from the ORP for an extended ambush; actions of all forces timed to keep surprise and withdraw before a counterattack (security early warning and isolation, assault force search/EPW/equipment, indirect fires to finish and cover withdrawal); withdrawal routes; passage of lines if necessary; contingencies for chance contact, danger areas en route to the ORP, and contact during withdrawal."},
      {id:"b7",  g:"pl", num:"2b(8-9)",    crit:true,   name:"Fire support plan & graphic control measures", d:"Fire support nested with higher HQ: indirect fires into the kill zone and in support of the security forces, echeloned fires for the desired effects, observation plan with observer redundancy; graphic control measures for direct fires, fire support, and enabler support throughout the operation."},
      {id:"b8",  g:"pl", num:"2b(10-11), 2c-d", crit:true, name:"Protection, sustainment & risk management", d:"Tactical deception and camouflage; PPEP level; consumption and resupply during the ambush; CASEVAC and MEDEVAC; degraded communications; routine and emergency resupply; consolidated fires and graphics control plan provided to the commander; risk management integrated throughout TLP."},
      {id:"b9",  g:"pl", num:"3",          crit:true,   name:"OPORD issued",                      d:"The squad leader issues the operation order."},
      {id:"b10", g:"pl", num:"4",          ldr:true,    name:"Confirmation briefs",               d:"Conducted immediately after the OPORD — subordinates understand the commander's intent, their specific tasks, the concept of the operation, and how their mission relates to other units' missions."},
      {id:"b11", g:"pr", num:"5a-b",       ldr:true,    name:"Backbrief & rehearsals",            d:"Backbrief with the platoon leader before rehearsals if necessary; rehearses actions on the objective, the scheme of the ambush, routes throughout the operation, fire support, and UAS/counter-UAS actions."},
      {id:"b12", g:"pr", num:"5c-e",       ldr:true,    name:"PCCs / PCIs, supervision & coordination", d:"Conducts precombat checks and inspections; supervises subordinates' TLP and continues priorities of work; finalizes coordination with adjacent and supporting units and higher HQ as required."},
      {id:"b13", g:"pr", num:"5f",         ldr:true,    name:"Movement to and occupation of the ORP", d:"Tactical movement to the ORP; passage of lines through friendly units as required; secures and occupies the ORP per the OPORD or SOP; issues a contingency plan to the ORP leadership."},
      {id:"b14", g:"pr", num:"5g",         ldr:true,    name:"Leader's reconnaissance",           d:"Security element for the recon party; UAS in support; pinpoints the kill zone and establishes security on it; verifies and updates intelligence; selects the kill zone and the assault, support, and security positions (cover and concealment, observation and fire into the kill zone, assault position close enough for rapid assault, early warning, prevents escape and reinforcement); selects primary and alternate covered and concealed routes; leaves a surveillance team with a contingency plan; returns to the ORP undetected; disseminates information."},
      {id:"b15", g:"pr", num:"5h-j",       ldr:true,    name:"Plan adjustment, FRAGORDs & readiness report", d:"Updates the enemy situation and allows time for subordinate leaders to disseminate changes; assigns security, support, and assault positions; designates withdrawal routes to the ORP and control measures at the site (kill zone, limit of advance, assault-by-fire and SBF positions, assault position, TRP); designates the formation and any ORP security element; issues FRAGORDs as necessary; reports readiness to execute to higher HQ."},
      {id:"b16", g:"ex", num:"6a",         crit:true,   name:"Security force occupies its positions", d:"Departs the ORP and moves tactically to the security positions; early warning devices positioned first; secures the flanks and provides detection and early warning; covers dismounted avenues of approach into the kill zone; noise and light discipline; sectors of observation and fire with sector stakes; claymores, AT mines, and obstacles as the situation dictates; concealment checked from the enemy side if possible; teams positioned for control; informs and maintains communications with the squad leader."},
      {id:"b17", g:"ex", num:"6b-d",       crit:true,   name:"Support and assault forces occupy; final preparations", d:"Once security is set or on order, support and assault forces move tactically to and occupy their positions; individual sectors of observation and fire with sector stakes to prevent fratricide; claymores, AT mines, obstacles, and early warning devices emplaced; concealment checked from the enemy side (leaders do not enter the kill zone); team leaders positioned for command and control, monitor target acquisition and night observation devices, report positions established, and maintain communications with the squad leader."},
      {id:"b18", g:"ex", num:"6e-g",       crit:true,   name:"OPSEC, detection & decision to execute", d:"Maintains operational security and deception as to the ambush location and strength; security force detects the enemy and alerts the squad leader with the size of the target, direction of movement, and any special weapons or equipment; squad leader assesses the situation and determines whether to execute."},
      {id:"b19", g:"ex", num:"7a-e",       crit:true,   name:"Initiates the ambush and controls fires", d:"Initiated with the most casualty-producing weapon, machine gun fire, or detonation of mines/explosives (multiple simultaneous antiarmor shots against mounted or armored elements); assault and support forces deliver accurate fires and inflict maximum damage, weapons engaging targets suited to them; security force blocks enemy maneuver, reinforcement, and escape; indirect fires support the ambush; fires shifted, lifted, or ceased by voice or other tactical means when the assault force clears the kill zone."},
      {id:"b20", g:"ex", num:"7f",         crit:true,   name:"Assault force clears the kill zone", d:"On the squad leader's order and before the enemy can react effectively: kills or captures enemy forces; destroys or captures enemy equipment and documents within the commander's intent; clears through and establishes local security beyond the kill zone."},
      {id:"b21", g:"ex", num:"7g",         crit:true,   name:"Reports and withdraws",             d:"Reports ambush complete and withdrawing to higher HQ; support position covers the assault force's withdrawal from the kill zone; security team covers the support force's withdrawal from the site; planned indirect fires cover the security force's withdrawal and complete the destruction of the enemy if needed; all elements withdraw to the ORP, if planned."},
      {id:"b22", g:"as", num:"8",          ldr:true,    name:"Follow-through",                    d:"Continuously monitors the ambush to collect relevant information; evaluates progress toward end-state conditions and objectives; directs adjustments to keep operations aligned with the commander's intent; receives updates on the location and status of all elements, including attachments."},
      {id:"b23", g:"as", num:"9a",                      name:"Consolidation",                     d:"Eliminates enemy resistance if pursued from the ambush site; 360-degree security (key terrain, observation post, security patrols); assists passage of follow-on forces if required; improves security (direct-fire planning, fires, battle position preparation, EA development); secures EPWs and detainees; prepares for counterattack."},
      {id:"b24", g:"as", num:"9b",                      name:"Reorganization",                    d:"Essential medical treatment and CASEVAC/MEDEVAC; treats, evacuates, and processes EPWs and detainees; cross-levels personnel and loads and adjusts task organization; resupply, rearm, refuel; redistributes ammunition and other supplies; maintenance as needed."},
      {id:"b25", g:"as", num:"10",         ldr:true,    name:"Reports status",                    d:"The squad leader reports the squad's status and continues operations according to the order and the commander's guidance."}
    ]
  };

  /* Tactical lanes — see LANE FORMAT above. Set metric on a lane to switch on its
     objective number, e.g. metric: {label:"Time to complete", unit:"min", better:"low"}. */
  var LANES = [
    {id:"recon",  label:"Recon",  tag:"lane 1", full:"Lane 1 — Area / Zone Reconnaissance", metric:null, rubrics:[RECON_RUBRIC, REPORT_RUBRIC]},
    {id:"attack", label:"Attack", tag:"lane 2", full:"Lane 2 — Squad Attack",               metric:null, rubrics:[ATTACK_RUBRIC]},
    {id:"ambush", label:"Ambush", tag:"lane 3", full:"Lane 3 — Squad Ambush",               metric:null, rubrics:[AMBUSH_RUBRIC]}
  ];

  return {
    TITLE: "Advanced Squad STX Scorecard",
    UNIT: "D Co, 2-506 IN",
    SQUADS: SQUADS,
    SQUAD_NAMES: SQUAD_NAMES,
    TLP: {
      label: "TLP", tag: "OPORD eval", full: "Squad Leader OPORD / TLP",
      note: "Squad Leader OPORD Evaluation — D Co, 2-506 IN (White Currahee). Refs: TC 3-21.76, ATP 3-21.8.",
      items: TLP_ITEMS, groups: TLP_GROUPS,
      tThreshold: 20 /* T: all criticals GO and >= 20 of 24 GO */
    },
    LANES: LANES,
    TLP_WEIGHT: 0.20,   /* TLP share of the total; lanes split the rest by their weight */
    METRIC_BLEND: 0.5   /* share of a lane score that comes from its objective metric */
  };
});
