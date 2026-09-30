import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, AlertTriangle, MessageSquare, Scale, MapPin, Eye, FileText, 
  Download, Share2, Printer, Phone, HelpCircle, ArrowRight, ArrowLeft, 
  Volume2, Mic, MicOff, Settings, Upload, CheckCircle2, ChevronRight, 
  X, User, Lock, HeartHandshake, RefreshCw, Layers, Map, EyeOff, Info, 
  Bell, Check, Compass, DownloadCloud, LogOut, Edit3, Trash2, Key
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { authService, dbService, storageService } from './firebase';

// ----------------------------------------------------
// LOCALIZATION DICTIONARY
// ----------------------------------------------------
const LOCALIZATION = {
  en: {
    appName: "Smart FIR Portal",
    tagline: "Government-Guided Citizen Legal & Emergency Assistant",
    securityStatus: "Security Clearance: ACTIVE & SECURED (BNS/CrPC Compliant)",
    activeLocation: "Sakinaka Region, Zone 10, Mumbai, MH",
    startAssistant: "Start AI Legal Guidance",
    sosTrigger: "EMERGENCY SOS PANIC BUTTON",
    lockerTitle: "Secure Evidence Locker",
    locatorTitle: "Police Precinct Maps Locator",
    rightsHandbook: "Citizen Rights Handbook",
    sirenToggle: "Trigger Emergency Alarm",
    sirenPlaying: "Siren Sounding...",
    enterMessage: "Describe the incident in simple words...",
    send: "Submit",
    warningTitle: "CITIZEN PROTECTION WARNING",
    warningAadhaar: "For security, do not share Aadhaar, passwords, or bank credentials. Your data is protected by encryption.",
    emergencyHeader: "!!! EMERGENCY SOS ACTIVE !!!",
    emergencySub: "Your safety is our top priority. Please read instructions below.",
    reachSafety: "STEP 1: Move to a crowded or secure location immediately.",
    dispatching: "Emergency dispatch active. Nearby patrol notified of your coordinates...",
    coordinates: "Your Coordinates:",
    sirenSimulation: "Loud alarm sounds locally to alert nearby citizens.",
    call100: "Call Police Control (100)",
    call112: "Call Emergency Services (112)",
    call1091: "Call Women Helpline (1091)",
    cancelEmergency: "Deactivate SOS Alert",
    classificationTitle: "AI Incident Categorization",
    confirmCategory: "Please review and confirm the incident categorization to proceed:",
    severityLevel: "Assessed Incident Severity:",
    confirmProceed: "Confirm & Start Guided Questionnaire",
    changeCategory: "Manually Re-Classify Category",
    legalRightsTitle: "Citizen Legal Rights Explanation",
    rightsSub: "Under Bharatiya Nyaya Sanhita (BNS), 2023 & IPC, you are protected by structural rights:",
    proceedToDraft: "Generate Formal FIR Draft",
    firDraftTitle: "FORM I - FIRST INFORMATION REPORT COMPLAINT DRAFT",
    firDraftSub: "(Under Section 154 of CrPC / Section 173 of BNS, 2023)",
    firDisclaimer: "Disclaimer: This app provides FIR filing guidance only and does not replace official police FIR submission.",
    downloadPdf: "Download PDF Draft",
    printFir: "Print FIR",
    shareDraft: "Share Draft",
    pdfReady: "FIR Complaint Draft PDF Generated",
    lockerSub: "Upload screenshots, receipts, or photos. Files are encrypted and indexed to your complaint.",
    addEvidence: "Secure New File",
    lockerTimeline: "Secured Evidence Envelope List",
    locatorSub: "Showing nearest stations within 5km zone. Click maps to open GPS directions.",
    cyberCell: "Cyber Crime Cell",
    womenCell: "Women Police Precinct",
    getDirections: "Get Directions",
    voiceInputActive: "Listening... speak now.",
    voiceInputClick: "Simulate Voice Command",
    backToDashboard: "Return to Main Dashboard",
    splashLoading: "Securing connection and loading Legal Codification Databases...",
    quickLaunch: "Launch Portal"
  },
  hi: {
    appName: "स्मार्ट FIR पोर्टल",
    tagline: "सरकारी नागरिक कानूनी और आपातकालीन डिजिटल सहायक",
    securityStatus: "सुरक्षा स्थिति: सक्रिय और सुरक्षित (BNS/CrPC अनुपालन)",
    activeLocation: "साकीनाका क्षेत्र, जोन 10, मुंबई, महाराष्ट्र",
    startAssistant: "एआई कानूनी मार्गदर्शन शुरू करें",
    sosTrigger: "आपातकालीन SOS पैनिक बटन",
    lockerTitle: "सुरक्षित साक्ष्य लॉकर",
    locatorTitle: "पुलिस स्टेशन खोजक",
    rightsHandbook: "नागरिक अधिकार पुस्तिका",
    sirenToggle: "आपातकालीन अलार्म बजाएं",
    sirenPlaying: "सायरन बज रहा है...",
    enterMessage: "घटना का सरल शब्दों में वर्णन करें...",
    send: "जमा करें",
    warningTitle: "नागरिक सुरक्षा चेतावनी",
    warningAadhaar: "सुरक्षा के लिए, आधार, पासवर्ड या बैंक विवरण साझा न करें। आपका डेटा एन्क्रिप्टेड है।",
    emergencyHeader: "!!! आपातकालीन SOS सक्रिय !!!",
    emergencySub: "आपकी सुरक्षा हमारी सर्वोच्च प्राथमिकता है। कृपया नीचे दिए गए निर्देश पढ़ें।",
    reachSafety: "चरण 1: तुरंत किसी सुरक्षित या भीड़भाड़ वाले स्थान पर जाएं।",
    dispatching: "आपातकालीन प्रेषण सक्रिय। नजदीकी पेट्रोलिंग को आपके निर्देशांक भेजे गए...",
    coordinates: "आपके निर्देशांक:",
    sirenSimulation: "आसपास के लोगों को सचेत करने के लिए तेज सायरन बज रहा है।",
    call100: "पुलिस नियंत्रण कक्ष (100)",
    call112: "आपातकालीन सेवाएं (112)",
    call1091: "महिला हेल्पलाइन (1091)",
    cancelEmergency: "आपातकालीन अलर्ट बंद करें",
    classificationTitle: "घटना वर्गीकरण",
    confirmCategory: "आगे बढ़ने के लिए कृपया घटना वर्गीकरण की समीक्षा और पुष्टि करें:",
    severityLevel: "निर्धारित घटना गंभीरता स्तर:",
    confirmProceed: "पुष्टि करें और प्रश्नोत्तरी शुरू करें",
    changeCategory: "श्रेणी मैन्युअल रूप से बदलें",
    legalRightsTitle: "नागरिकों के कानूनी अधिकार",
    rightsSub: "भारतीय न्याय संहिता (BNS), 2023 के तहत आप निम्नलिखित अधिकारों द्वारा सुरक्षित हैं:",
    proceedToDraft: "औपचारिक FIR ड्राफ्ट तैयार करें",
    firDraftTitle: "फॉर्म I - प्रथम सूचना रिपोर्ट शिकायत मसुदा",
    firDraftSub: "(सीआरपीसी की धारा 154 / बीएनएस, 2023 की धारा 173 के तहत)",
    firDisclaimer: "अस्वीकरण: यह ऐप केवल FIR दर्ज करने के लिए मार्गदर्शन प्रदान करता है और आधिकारिक पुलिस FIR जमा करने का स्थान नहीं लेता है।",
    downloadPdf: "पीडीएफ ड्राफ्ट डाउनलोड करें",
    printFir: "प्रिंट करें",
    shareDraft: "साझा करें",
    pdfReady: "FIR शिकायत मसुदा पीडीएफ सफलतापूर्वक बनाया गया",
    lockerSub: "स्क्रीनशॉट, रसीदें या तस्वीरें अपलोड करें। फाइलें एन्क्रिप्टेड हैं और आपकी शिकायत में जोड़ी गई हैं।",
    addEvidence: "नया साक्ष्य सुरक्षित करें",
    lockerTimeline: "सुरक्षित साक्ष्य सूची",
    locatorSub: "5 किमी के दायरे में निकटतम पुलिस स्टेशन दिखाए जा रहे हैं।",
    cyberCell: "साइबर क्राइम सेल",
    womenCell: "महिला पुलिस स्टेशन",
    getDirections: "दिशा निर्देश प्राप्त करें",
    voiceInputActive: "सुन रहा है... अब बोलें।",
    voiceInputClick: "आवाज इनपुट अनुकरण",
    backToDashboard: "मुख्य डैशबोर्ड पर लौटें",
    splashLoading: "कनेक्शन सुरक्षित किया जा रहा है और कानूनी डेटाबेस लोड हो रहा है...",
    quickLaunch: "पोर्टल शुरू करें"
  },
  mr: {
    appName: "स्मार्ट FIR पोर्टल",
    tagline: "शासकीय नागरिक कायदेशीर आणि आणीबाणी सहाय्यक",
    securityStatus: "सुरक्षा: सक्रिय आणि सुरक्षित (BNS/CrPC सुसंगत)",
    activeLocation: "साकीनाका परिसर, झोन १०, मुंबई, महाराष्ट्र",
    startAssistant: "एआय कायदेशीर मार्गदर्शन सुरू करा",
    sosTrigger: "आणीबाणी SOS पॅनिक बटण",
    lockerTitle: "सुरक्षित पुरावा लॉकर",
    locatorTitle: "पोलीस स्टेशन शोधक",
    rightsHandbook: "नागरिक अधिकार पुस्तिका",
    sirenToggle: "आणीबाणी अलार्म वाजवा",
    sirenPlaying: "सायरन वाजत आहे...",
    enterMessage: "घटनेचे साध्या शब्दांत वर्णन करा...",
    send: "पाठवा",
    warningTitle: "नागरिक सुरक्षा चेतावणी",
    warningAadhaar: "सुरक्षेसाठी, आधार, पासवर्ड किंवा बँक तपशील शेअर करू नका. तुमचा डेटा सुरक्षित आहे.",
    emergencyHeader: "!!! आणीबाणी SOS सक्रिय !!!",
    emergencySub: "तुमची सुरक्षा आमची सर्वोच्च प्राथमिकता आहे. कृपया खालील सूचना वाचा.",
    reachSafety: "पायरी १: ताबडतोब सुरक्षित किंवा गर्दीच्या ठिकाणी जा.",
    dispatching: "आणीबाणी प्रतिसाद सुरू. जवळच्या गस्ती पथकाला तुमचे स्थान पाठवले आहे...",
    coordinates: "तुमचे निर्देशांक:",
    sirenSimulation: "आसपासच्या लोकांना सावध करण्यासाठी सायरन वाजत आहे.",
    call100: "पोलीस नियंत्रण (100)",
    call112: "आणीबाणी सेवा (112)",
    call1091: "महिला हेल्पलाइन (1091)",
    cancelEmergency: "आणीबाणी मोड बंद करा",
    classificationTitle: "घटना वर्गीकरण",
    confirmCategory: "पुढे जाण्यासाठी कृपया घटना वर्गीकरणाचे पुनरावलोकन आणि पुष्टी करा:",
    severityLevel: "घटना गांभीर्य पातळी:",
    confirmProceed: "पुष्टी करा आणि प्रश्न सुरू करा",
    changeCategory: "श्रेणी मॅन्युअली बदला",
    legalRightsTitle: "नागरिकांचे कायदेशीर अधिकार",
    rightsSub: "भारतीय न्याय संहिता (BNS), २०२३ नुसार आपण खालील अधिकारांद्वारे संरक्षित आहात:",
    proceedToDraft: "औपचारिक FIR मसुदा तयार करा",
    firDraftTitle: "फॉर्म I - प्रथम माहिती अहवाल तक्रार मसुदा",
    firDraftSub: "(सीआरपीसीच्या कलम १५४ / बीएनएस, २०२३ च्या कलम १७३ अंतर्गत)",
    firDisclaimer: "अस्वीकरण: हे ॲप फक्त FIR दाखल करण्यासाठी मार्गदर्शन प्रदान करते आणि अधिकृत पोलीस FIR सबमिशनची जागा घेत नाही.",
    downloadPdf: "पीडीएफ मसुदा डाउनलोड करा",
    printFir: "प्रिंट करा",
    shareDraft: "मसुदा शेअर करा",
    pdfReady: "FIR तक्रार मसुदा पीडीएफ यशस्वीरित्या तयार केला",
    lockerSub: "स्क्रीनशॉट, पावती किंवा फोटो अपलोड करा. फायली सुरक्षितपणे तक्रारीत जोडल्या आहेत.",
    addEvidence: "नवीन पुरावा जतन करा",
    lockerTimeline: "पुरावा संच यादी",
    locatorSub: "५ किमी परिसरातील पोलीस स्टेशन दाखवत आहे. दिशा मिळवण्यासाठी मॅपवर क्लिक करा.",
    cyberCell: "सायबर क्राईम सेल",
    womenCell: "महिला पोलीस ठाणे",
    getDirections: "दिशा मिळवा",
    voiceInputActive: "ऐकत आहे... आता बोला.",
    voiceInputClick: "आवाज इनपुट सिम्युलेशन",
    backToDashboard: "मुख्य डॅशबोर्डवर परत जा",
    splashLoading: "कायदेशीर डेटाबेस लोड केला जात आहे...",
    quickLaunch: "पोर्टल सुरू करा"
  }
};

// ----------------------------------------------------
// MOCK DATA FOR POLICE STATIONS
// ----------------------------------------------------
const POLICE_STATIONS = [
  { id: 1, name: "Sakinaka Police Station", distance: "0.8 km", contact: "+91-22-28522222", address: "Sakinaka Junction, Andheri East, Mumbai - 400072", lat: 19.0968, lng: 72.8884, type: "General" },
  { id: 2, name: "Mumbai Cyber Crime Precinct (Bandra)", distance: "3.2 km", contact: "+91-22-26590200", address: "Bandra Kurla Complex, Bandra East, Mumbai - 400051", lat: 19.0607, lng: 72.8362, type: "Cyber Cell" },
  { id: 3, name: "Ghatkopar West Women Helpline Station", distance: "2.5 km", contact: "+91-22-25113333", address: "LBS Marg, Ghatkopar West, Mumbai - 400086", lat: 19.0863, lng: 72.9090, type: "Women Station" },
  { id: 4, name: "Andheri East Divisional HQ", distance: "4.1 km", contact: "+91-22-26831111", address: "MV Road, Andheri East, Mumbai - 400069", lat: 19.1136, lng: 72.8697, type: "General" },
  { id: 5, name: "Powai Hillside Police Station", distance: "1.9 km", contact: "+91-22-25702222", address: "Central Avenue, Hiranandani, Powai, Mumbai - 400076", lat: 19.1176, lng: 72.9060, type: "General" }
];

// ----------------------------------------------------
// DYNAMIC QUESTIONS BY CATEGORY
// ----------------------------------------------------
const CATEGORY_QUESTIONS = {
  "Theft / Robbery": [
    { key: "stolenItem", q: "What specific items were stolen?", type: "text", placeholder: "e.g., Black leather wallet containing cash, Gold ring 10g, HP Laptop" },
    { key: "itemValue", q: "What is the approximate total value of the stolen item(s)?", type: "text", placeholder: "e.g., Rs. 45,000" },
    { key: "hasCctv", q: "Are there visible CCTV cameras at the theft location?", type: "select", options: ["Yes, camera is visible", "No cameras visible", "Not sure"] },
    { key: "suspectDesc", q: "Can you describe the physical features of the suspect(s)?", type: "text", placeholder: "e.g., Man around 30 years old, height 5'8\", wearing red jacket" }
  ],
  "Cybercrime / Fraud": [
    { key: "transactionId", q: "What is the Transaction ID, UPI Reference Number, or account number involved?", type: "text", placeholder: "e.g., UPI Ref 412894038290, Bank Acc 1009849202" },
    { key: "platformName", q: "Which website, banking app, or platform did the fraud occur on?", type: "text", placeholder: "e.g., SBI net banking, Telegram fake job group, WhatsApp scam call" },
    { key: "hasScreenshots", q: "Have you saved screenshots of the payments, fake profiles, or chats?", type: "select", options: ["Yes, screenshots saved", "No, deleted them", "Can retrieve them later"] },
    { key: "suspectContact", q: "What mobile number or social ID did the scammer use?", type: "text", placeholder: "e.g., Mobile +91-8899201928, Telegram ID @EarnDaily99" }
  ],
  "Assault / Violence": [
    { key: "injuriesSustained", q: "Describe the physical injuries sustained, if any.", type: "text", placeholder: "e.g., Minor cut on right forehead, bruise on shoulder" },
    { key: "hasMedicalReport", q: "Have you undergone a medical exam or obtained a Doctor's report?", type: "select", options: ["Yes, medical exam done", "No, will visit hospital shortly", "No injuries sustained"] },
    { key: "weaponUsed", q: "Was any weapon or object used to threaten or harm you?", type: "text", placeholder: "e.g., Wooden stick, iron pipe, no weapon used" },
    { key: "relationshipAccused", q: "Is the attacker known to you, or was it a stranger?", type: "text", placeholder: "e.g., Neighbor, stranger, colleague" }
  ],
  "Harassment / Stalking": [
    { key: "stalkerDetails", q: "Describe the stalker or details about the harassment.", type: "text", placeholder: "e.g., Group of three teenagers near Metro gate, anonymous caller calling late night" },
    { key: "frequency", q: "How frequently has this harassment occurred?", type: "text", placeholder: "e.g., Multiple calls daily for the last 3 days, followed twice this week" },
    { key: "witnessDetails", q: "Were there any bystanders, shopkeepers, or witnesses who noticed this?", type: "text", placeholder: "e.g., Shopkeeper of local tea stall witnessed it" },
    { key: "specialSupport", q: "Would you like a female police officer to handle your inquiry?", type: "select", options: ["Yes, definitely", "Either is fine", "Not required"] }
  ],
  "Domestic Violence": [
    { key: "abuserRelation", q: "What is your relation to the alleged abuser?", type: "text", placeholder: "e.g., Spouse, father-in-law, family relative" },
    { key: "abuseDuration", q: "How long has this abuse been ongoing?", type: "text", placeholder: "e.g., Past 1 year, escalated severely this week" },
    { key: "medicalNeeded", q: "Do you require immediate medical shelter or protective intervention?", type: "select", options: ["Yes, urgently need protective shelter", "Yes, medical attention required", "No, currently in safe quarters"] },
    { key: "anyChildren", q: "Are there children present in the household who are also at risk?", type: "select", options: ["Yes, children are at risk", "No children involved"] }
  ],
  "Other": [
    { key: "otherDetails", q: "Please describe additional details important for the formal complaint:", type: "text", placeholder: "Provide timelines, threat descriptions, or property lost" }
  ]
};

// ----------------------------------------------------
// BNS/IPC CODIFICATION
// ----------------------------------------------------
const getLegalSections = (category) => {
  switch (category) {
    case "Theft / Robbery":
      return {
        ipc: "Section 379 IPC (Theft)",
        bns: "Section 303 BNS (Theft)",
        severity: "MEDIUM",
        desc: "Cognizable offense. Section 303 BNS mandates punishment with imprisonment up to 3 years, fine, or both. Immediate registration of FIR is required."
      };
    case "Cybercrime / Fraud":
      return {
        ipc: "Section 420 IPC (Cheating) & Sec 66D IT Act (Impersonation)",
        bns: "Section 318 BNS (Cheating) & Section 66D Information Technology Act",
        severity: "HIGH",
        desc: "Cognizable. Scams involving online financial fraud should be registered immediately. Contacting 1930 within the Golden Hour freezes funds."
      };
    case "Assault / Violence":
      return {
        ipc: "Section 323 IPC (Voluntarily causing hurt) & Section 351 IPC (Assault)",
        bns: "Section 115 BNS (Voluntarily causing hurt) & Section 131 BNS (Assault)",
        severity: "HIGH",
        desc: "Cognizable. Imprisonment up to 1 year. Obtaining a Medico-Legal Case (MLC) report from a government hospital is highly recommended."
      };
    case "Harassment / Stalking":
      return {
        ipc: "Section 354D IPC (Stalking) & Section 509 IPC (Word/gesture to insult modesty)",
        bns: "Section 78 BNS (Stalking) & Section 79 BNS (Insulting modesty of a woman)",
        severity: "HIGH",
        desc: "Cognizable. First conviction is bailable. FIR must be recorded by a female officer. Victim anonymity is protected by law."
      };
    case "Domestic Violence":
      return {
        ipc: "Section 498A IPC (Cruelty by Husband or relatives)",
        bns: "Section 85 BNS (Cruelty by Husband or relatives)",
        severity: "CRITICAL",
        desc: "Cognizable & Non-Bailable. Strong protective legal systems. Immediate protection orders and shelter assistance can be claimed through Magistrate."
      };
    default:
      return {
        ipc: "Relevant sections of IPC",
        bns: "Relevant sections of BNS, 2023",
        severity: "MEDIUM",
        desc: "Police will determine the exact legal sections upon verification of physical statement."
      };
  }
};

// ----------------------------------------------------
// BILINGUAL TRANSLATION FOR PDF/PREVIEW LABELS
// ----------------------------------------------------
const TRANSLATED_COMPLAINT = {
  en: {
    headerTitle: "FORM I - FIRST INFORMATION REPORT COMPLAINT DRAFT",
    headerSub: "(Recorded Under Section 154 of Cr.P.C / Section 173 of Bharatiya Nyaya Sanhita, 2023)",
    section1: "1. DISTRICT & PRECINCT AREA",
    state: "State: Maharashtra",
    district: "District: Mumbai City Division",
    station: "Police Precinct: Sakinaka Police Station",
    refNo: "Draft Code Reference: SMART_FIR_SECURE_",
    section2: "2. COMPLAINANT IDENTIFICATION",
    name: "Full Name:",
    phone: "Mobile Phone:",
    city: "Address/City:",
    section3: "3. TIMELINE & LOCATION OF OFFENCE",
    incidentDate: "Occurrence Date/Time:",
    incidentLoc: "Exact Location:",
    witness: "Witness Details:",
    accused: "Suspect/Accused Information:",
    section4: "4. FORMAL STATEMENT DESCRIPTION",
    section5: "5. RECORDED SYSTEM QUESTIONNAIRE RECORDS",
    section6: "6. prima facie LEGAL MATRIX APPLICABLE",
    severity: "Severity Level:",
    bnsCode: "BNS 2023 Section:",
    ipcCode: "IPC 1860 Section:",
    note: "Legal Offense Notes:",
    section7: "7. SECURED EVIDENCE VAULT RECORDS",
    fileLabel: "File Index:",
    declaration: "DECLARATION: This document is an AI-generated guidance draft to assist in filing a formal police complaint. This draft does not constitute automatic FIR filing until submitted, verified, and signed by an authorized Police Officer at a registered police precinct.",
    signatureComplainant: "Signature of Complainant",
    signatureOfficer: "Draft Verification Seal"
  },
  hi: {
    headerTitle: "फॉर्म I - प्रथम सूचना रिपोर्ट (FIR) शिकायत का मसौदा",
    headerSub: "(दंड प्रक्रिया संहिता की धारा 154 / भारतीय नागरिक सुरक्षा संहिता, 2023 की धारा 173 के तहत)",
    section1: "1. जिला एवं पुलिस स्टेशन विवरण",
    state: "राज्य: महाराष्ट्र",
    district: "जिला: मुंबई शहर प्रभाग",
    station: "पुलिस स्टेशन: साकीनाका पुलिस स्टेशन",
    refNo: "मसौदा संदर्भ संख्या: SMART_FIR_SECURE_",
    section2: "2. शिकायतकर्ता का विवरण",
    name: "पूरा नाम:",
    phone: "मोबाइल नंबर:",
    city: "पता/शहर:",
    section3: "3. घटना का समय और स्थान",
    incidentDate: "घटना की तिथि/समय:",
    incidentLoc: "घटना का स्थान:",
    witness: "गवाहों का विवरण:",
    accused: "संदिग्ध/आरोपी का विवरण:",
    section4: "4. औपचारिक शिकायत विवरण",
    section5: "5. दर्ज किए गए प्रश्नावली रिकॉर्ड",
    section6: "6. कानूनी धाराएं (prima facie लागू)",
    severity: "गंभीरता स्तर:",
    bnsCode: "बीएनएस 2023 धारा:",
    ipcCode: "आईपीसी 1860 धारा:",
    note: "कानूनी अपराध नोट्स:",
    section7: "7. सुरक्षित डिजिटल साक्ष्य रिकॉर्ड",
    fileLabel: "फ़ाइल अनुक्रमणिका:",
    declaration: "घोषणा: यह दस्तावेज़ औपचारिक पुलिस शिकायत दर्ज करने में सहायता के लिए एक एआई-जनरेटेड मार्गदर्शन मसौदा है। यह मसौदा तब तक स्वचालित एफआईआर दर्ज नहीं करता है जब तक कि इसे पंजीकृत पुलिस स्टेशन में अधिकृत पुलिस अधिकारी द्वारा प्रस्तुत, सत्यापित और हस्ताक्षरित नहीं किया जाता है।",
    signatureComplainant: "शिकायतकर्ता के हस्ताक्षर",
    signatureOfficer: "मसौदा सत्यापन सील"
  }
};

const EMERGENCY_TRIGGERS = [
  "help", "attack", "unsafe", "kidnapped", "threatened", "following me", 
  "violence", "emergency", "scared", "siren", "kill", "blood", "rape", 
  "assaulted", "beating", "bachao", "maardiya", "chori", "loot", "बचाओ", "मदद"
];

function App() {
  // Navigation & User
  const [currentScreen, setCurrentScreen] = useState('splash'); // splash, auth, dashboard, chat, stepwizard, classification, questions, rights, preview, pdfsuccess, locker, locator, sos, drafts
  const [language, setLanguage] = useState('en');
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: '', phone: '', city: '', language: 'en' });
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Inputs
  const [authTab, setAuthTab] = useState('login'); // login, register, otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState('');

  // Audio state
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const audioCtxRef = useRef(null);
  const osc1Ref = useRef(null);
  const lfoRef = useRef(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isTyping]);

  // Incident & Guided Questions State
  const [classifiedCategory, setClassifiedCategory] = useState("Other");
  const [severity, setSeverity] = useState("MEDIUM");
  const [guidedQuestions, setGuidedQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  // Accumulated Answers state
  const [answers, setAnswers] = useState({
    complainantName: "Anonymous Citizen",
    complainantPhone: "+91-XXXXXXXXXX",
    complainantAddress: "Mumbai, MH",
    incidentDate: new Date().toISOString().slice(0, 16),
    incidentLocation: "Sakinaka Metro Station Junction, Mumbai",
    witnessName: "Local witnesses present",
    witnessPhone: "N/A",
    incidentDesc: "",
    stolenItem: "",
    itemValue: "",
    hasCctv: "Not sure",
    suspectDesc: "",
    transactionId: "",
    platformName: "",
    hasScreenshots: "Yes, screenshots saved",
    suspectContact: "",
    injuriesSustained: "",
    hasMedicalReport: "No injuries",
    weaponUsed: "No weapon",
    relationshipAccused: "Unknown suspect",
    stalkerDetails: "",
    frequency: "",
    witnessDetails: "",
    specialSupport: "Either is fine",
    abuserRelation: "",
    abuseDuration: "",
    medicalNeeded: "No",
    anyChildren: "No children involved",
    otherDetails: ""
  });

  // Evidence files array
  const [evidenceFiles, setEvidenceFiles] = useState([
    { id: 1, name: "GPS_Coordinates_Log.txt", size: "1.2 KB", type: "text/plain", category: "Location Log", time: "Just now", url: "" }
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Saved Drafts state
  const [savedReports, setSavedReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(true);

  // Step-by-Step 8-Step Wizard State
  const [wizardCategory, setWizardCategory] = useState(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEvidenceChecked, setWizardEvidenceChecked] = useState({});
  const [wizardDocsChecked, setWizardDocsChecked] = useState({});
  const [wizardForm, setWizardForm] = useState({
    incidentDesc: '',
    incidentDate: new Date().toISOString().slice(0, 16),
    incidentLocation: '',
    stolenItems: '',
    estimatedValue: '',
    transactionId: '',
    platformName: '',
    complainantName: '',
    complainantPhone: '',
    complainantAddress: '',
    accusedDesc: '',
    witnessName: ''
  });

  // Draft Preview Tab (Bilingual)
  const [draftLangTab, setDraftLangTab] = useState('en'); // en, hi

  const [googleMapsKey, setGoogleMapsKey] = useState((import.meta.env && import.meta.env.VITE_GOOGLE_MAPS_KEY) || localStorage.getItem('google_maps_key') || 'AIzaSyAnH_-QDz_udVpG73gWJj1WMn4_l67Khto');

  // GPS updates & Live Location Tracking
  const [gpsCoords, setGpsCoords] = useState({ lat: 19.0968, lng: 72.8884 });
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [liveCoords, setLiveCoords] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [accuracyWarning, setAccuracyWarning] = useState('');
  const [lastUpdatedTime, setLastUpdatedTime] = useState('');
  const [accuracyMeters, setAccuracyMeters] = useState(0);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const watchIdRef = useRef(null);
  const mapContainerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const stationsMarkersRef = useRef([]);
  const hasSearchedPlacesRef = useRef(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const sortedStations = React.useMemo(() => {
    const stationsToDisplay = isLiveTracking ? nearbyStations : POLICE_STATIONS;
    if (!liveCoords) return stationsToDisplay;
    return [...stationsToDisplay].map(ps => ({
      ...ps,
      distance: calculateDistance(liveCoords.lat, liveCoords.lng, ps.lat, ps.lng) + " km"
    })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }, [liveCoords, nearbyStations, isLiveTracking]);

  // Initialize map
  useEffect(() => {
    if (currentScreen === 'locator') {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey || ''}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => initMap(false);
        document.head.appendChild(script);
      } else {
        initMap(isLiveTracking);
      }
    }
  }, [currentScreen]);

  const initMap = (trackingActive) => {
    if (!mapContainerRef.current || !window.google) return;
    if (!window.map) {
      window.map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 19.0968, lng: 72.8884 },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
      });
    }
    
    stationsMarkersRef.current.forEach(m => m.setMap(null));
    stationsMarkersRef.current = [];
    
    if (!trackingActive) {
      POLICE_STATIONS.forEach(ps => {
        const marker = new window.google.maps.Marker({
          position: { lat: ps.lat, lng: ps.lng },
          map: window.map,
          title: ps.name,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
        stationsMarkersRef.current.push(marker);
      });
    }
  };

  const updateUserMarker = (location) => {
    if (!window.map || !window.google) return;
    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: location,
        map: window.map,
        title: "You are here",
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      });
    } else {
      userMarkerRef.current.setPosition(location);
    }
  };

  const updateAccuracyCircle = (location, accuracy) => {
    if (!window.map || !window.google) return;
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = new window.google.maps.Circle({
        strokeColor: "#2563EB",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.35,
        map: window.map,
        center: location,
        radius: accuracy
      });
    } else {
      accuracyCircleRef.current.setCenter(location);
      accuracyCircleRef.current.setRadius(accuracy);
    }
  };

  const searchNearbyStations = (location, radius = 10000) => {
    if (!window.map || !window.google) return;
    setIsSearchingPlaces(true);
    console.log(`Nearby police station search started (Radius: ${radius}m)`);
    
    const service = new window.google.maps.places.PlacesService(window.map);
    const request = {
      location: location,
      radius: radius,
      keyword: 'police station',
      type: 'police'
    };

    service.nearbySearch(request, (results, status) => {
      console.log("Places API results received", status, results);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        
        stationsMarkersRef.current.forEach(m => m.setMap(null));
        stationsMarkersRef.current = [];
        
        const formattedStations = results.map((place, index) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: window.map,
            title: place.name,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
          stationsMarkersRef.current.push(marker);
          
          return {
            id: place.place_id || `live-${index}`,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            type: 'Police Station',
            contact: '100'
          };
        });
        
        setNearbyStations(formattedStations);
        setIsSearchingPlaces(false);
        console.log("Station cards updated");
      } else if (radius === 10000) {
        console.log("No stations found within 10km, increasing radius to 25km");
        searchNearbyStations(location, 25000);
      } else {
        setIsSearchingPlaces(false);
        setNearbyStations([]);
      }
    });
  };

  const startLiveTracking = () => {
    if (!navigator.geolocation) {
      setTrackingError("Geolocation is not supported by your browser.");
      return;
    }
    setTrackingError('');
    setIsLiveTracking(true);
    hasSearchedPlacesRef.current = false;
    initMap(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const accuracy = position.coords.accuracy;
        console.log("User location detected:", userLocation);

        setLiveCoords(userLocation);
        setAccuracyMeters(accuracy);
        setLastUpdatedTime(new Date().toLocaleTimeString());
        setTrackingError('');

        if (accuracy > 500) {
          setAccuracyWarning("Your location accuracy is low. For exact location, use mobile GPS or enable device location services.");
        } else {
          setAccuracyWarning("");
        }

        updateUserMarker(userLocation);
        updateAccuracyCircle(userLocation, accuracy);
        if (window.map) window.map.setCenter(userLocation);

        if (!hasSearchedPlacesRef.current) {
          hasSearchedPlacesRef.current = true;
          searchNearbyStations(userLocation);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setTrackingError("Unable to track location. Please try again.");
        setIsLiveTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );
  };

  const stopLiveTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
    hasSearchedPlacesRef.current = false;
    setNearbyStations([]);
    setLiveCoords(null);
    setTrackingError("Live location tracking stopped.");
    setAccuracyWarning("");

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }
    
    initMap(false);
    if (window.map) window.map.setCenter({ lat: 19.0968, lng: 72.8884 });
  };

  const refreshLocation = () => {
    stopLiveTracking();
    setTimeout(() => startLiveTracking(), 500);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const text = LOCALIZATION[language] || LOCALIZATION['en'];

  // ----------------------------------------------------
  // FIREBASE AUTH SYNC
  // ----------------------------------------------------
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile data
        const profile = await dbService.getUser(user.uid);
        if (profile) {
          setUserProfile(profile);
          // Set answers defaults
          setAnswers(prev => ({
            ...prev,
            complainantName: profile.name || "Citizen User",
            complainantPhone: profile.phone || "+91-XXXXXXXXXX",
            complainantAddress: profile.city || "Mumbai, MH"
          }));
        } else {
          // Initialize profile
          const initialProfile = {
            name: user.displayName || "Citizen User",
            phone: "",
            city: "",
            language: language
          };
          await dbService.saveUser(user.uid, initialProfile);
          setUserProfile(initialProfile);
        }
        // Load saved reports
        fetchSavedReports(user.uid);
      } else {
        setUserProfile({ name: '', phone: '', city: '', language: 'en' });
        setSavedReports([]);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [language]);

  const fetchSavedReports = async (uid) => {
    setReportsLoading(true);
    try {
      const data = await dbService.getUserFIRReports(uid);
      setSavedReports(data);
    } catch (e) {
      console.error("Error loading reports:", e);
    }
    setReportsLoading(false);
  };

  // ----------------------------------------------------
  // AUDIO EMERGENCY SIREN (WEB AUDIO API)
  // ----------------------------------------------------
  const triggerAudioSiren = () => {
    if (isPlayingSiren) {
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch(e) {}
      }
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch(e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
      audioCtxRef.current = null;
      osc1Ref.current = null;
      lfoRef.current = null;
      setIsPlayingSiren(false);
    } else {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = audioCtx;

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

        const osc1 = audioCtx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc1Ref.current = osc1;

        // LFO sweeps frequency
        const lfo = audioCtx.createOscillator();
        lfo.frequency.setValueAtTime(1.8, audioCtx.currentTime);
        lfoRef.current = lfo;

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(160, audioCtx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);

        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        lfo.start();
        osc1.start();
        setIsPlayingSiren(true);
      } catch (err) {
        console.error("Siren Web Audio context blocked", err);
        setIsPlayingSiren(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (osc1Ref.current) {
        try { osc1Ref.current.stop(); } catch(e) {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e) {}
      }
    };
  }, []);

  // GPS coordination updates
  useEffect(() => {
    if (currentScreen === 'sos') {
      const interval = setInterval(() => {
        setGpsCoords(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.0001,
          lng: prev.lng + (Math.random() - 0.5) * 0.0001
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // ----------------------------------------------------
  // REAL-TIME NLP READINESS DASHBOARD UTILS
  // ----------------------------------------------------
  const getCompleteness = () => {
    let score = 0;
    if (userProfile.name && userProfile.name !== "Anonymous Citizen") score += 20;
    if (answers.incidentDate && !answers.incidentDate.includes("T")) score += 20;
    else if (answers.incidentDate) score += 10;
    if (answers.incidentLocation && answers.incidentLocation !== "Sakinaka metro junction, Mumbai") score += 20;
    if (answers.incidentDesc && answers.incidentDesc.length >= 15) score += 30;
    if (answers.witnessName || answers.accusedDesc) score += 10;
    return score > 100 ? 100 : score;
  };

  const getMissingFields = () => {
    const missing = [];
    if (!userProfile.name || userProfile.name === "Anonymous Citizen") missing.push(language === 'en' ? "Complainant Name" : language === 'hi' ? "शिकायतकर्ता का नाम" : "तक्रारदाराचे नाव");
    if (!answers.incidentDate || answers.incidentDate.includes("T")) missing.push(language === 'en' ? "Exact Date/Time" : language === 'hi' ? "सटीक तिथि/समय" : "अचूक वेळ");
    if (!answers.incidentLocation || answers.incidentLocation === "Sakinaka metro junction, Mumbai") missing.push(language === 'en' ? "Place of Occurrence" : language === 'hi' ? "घटना का स्थान" : "घटनेचे ठिकाण");
    if (!answers.incidentDesc || answers.incidentDesc.length < 15) missing.push(language === 'en' ? "Detailed Statement" : language === 'hi' ? "विस्तृत विवरण" : "तपशीलवार माहिती");
    return missing;
  };

  // ----------------------------------------------------
  // BOT RESPONSE CLASSIFIER AGENT (Firebase Cloud Function + Offline Fallback)
  // ----------------------------------------------------
  const handleBotResponse = (userText, currentHistory) => {
    setIsTyping(true);
    
    // Check for SOS triggers
    const containsEmergency = EMERGENCY_TRIGGERS.some(trigger => 
      userText.toLowerCase().includes(trigger)
    );

    if (containsEmergency) {
      setTimeout(() => {
        setIsTyping(false);
        setCurrentScreen('sos');
        triggerAudioSiren();
      }, 800);
      return;
    }

    // Aadhaar / bank CVV warnings
    const credentialsPattern = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
    const passwordTrigger = userText.toLowerCase().includes('password') || userText.toLowerCase().includes('otp') || userText.toLowerCase().includes('cvv');
    if (credentialsPattern.test(userText) || passwordTrigger) {
      setTimeout(() => {
        setIsTyping(false);
        setShowWarning(true);
        setChatHistory(prev => [
          ...prev,
          { 
            role: "assistant", 
            text: "🚨 SYSTEM PROTECTION NOTICE: For your complete legal security, please NEVER type your Aadhaar, banking passwords, or card CVVs. I have securely removed this input. Please describe only the details of the offense." 
          }
        ]);
      }, 1000);
      return;
    }

    // Make secure Cloud Function call
    const chatFunctionUrl = localStorage.getItem('chat_function_url') || 'https://us-central1-smart-fir-app.cloudfunctions.net/chat';
    const openAIApiKey = localStorage.getItem('openai_key') || 'AIzaSyDkNQQ7MVP-AcbC_bpjHmx6eseRCcg1aQw';
    const messagesToSend = currentHistory;

    const handleBotCall = async () => {
      const headers = {
        "Content-Type": "application/json"
      };
      if (openAIApiKey) {
        headers["Authorization"] = `Bearer ${openAIApiKey}`;
      }

      try {
        const res = await fetch(chatFunctionUrl, {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ 
            messages: messagesToSend,
            apiKey: openAIApiKey
          })
        });
        if (res.ok) {
          const data = await res.json();
          return data.reply;
        }
        console.warn("Cloud Function response not OK, attempting direct API fallback...");
      } catch (e) {
        console.warn("Cloud Function connection failed, attempting direct API fallback...", e);
      }

      // 2. Direct Client-side API Fallback (so index.html can run standalone!)
      if (!openAIApiKey) throw new Error("No API Key configured");

      const isGemini = openAIApiKey.startsWith('AIzaSy');
      const systemPrompt = `You are Smart FIR AI Assistant, a helpful legal guidance chatbot for Indian citizens. Reply only in the selected language. Ask one question at a time. Guide users through FIR filing. Do not claim FIR is officially filed. Do not ask for Aadhaar, OTP, passwords, or bank PIN.

Your role is to help users understand the FIR filing process in simple language.

In addition to your conversational response, when you believe you have gathered enough information to construct an FIR draft (or when the user explicitly requests to generate the draft), output a JSON block at the very end of your response inside a markdown code block labeled \`\`\`json-fir-draft ... \`\`\` containing the collected details structured as:
{
  "isReady": true,
  "category": "Theft / Robbery" | "Cybercrime / Fraud" | "Assault / Violence" | "Harassment / Stalking" | "Domestic Violence" | "Other",
  "date": "YYYY-MM-DDTHH:MM",
  "location": "Incident location details",
  "description": "A comprehensive summary of what happened, as described by the user",
  "complainantName": "Citizen's Name (if collected)",
  "complainantPhone": "Citizen's Phone (if collected)",
  "evidence": "Recommended evidence items"
}`;

      if (isGemini) {
        const alternateMessages = [];
        messagesToSend.forEach(msg => {
          const role = msg.role === 'user' ? 'user' : 'model';
          const cleanText = msg.text.replace(/```json-fir-draft[\s\S]*?```/g, '').trim();
          if (!cleanText) return;

          if (alternateMessages.length > 0 && alternateMessages[alternateMessages.length - 1].role === role) {
            alternateMessages[alternateMessages.length - 1].parts[0].text += '\n' + cleanText;
          } else {
            alternateMessages.push({
              role: role,
              parts: [{ text: cleanText }]
            });
          }
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${openAIApiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: alternateMessages,
            generationConfig: {
              temperature: 0.7
            }
          })
        });

        if (!response.ok) throw new Error("Direct Gemini call failed");
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

      } else {
        const openAiMessages = [
          { role: 'system', content: systemPrompt },
          ...messagesToSend.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text.replace(/```json-fir-draft[\s\S]*?```/g, '').trim()
          }))
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAIApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: openAiMessages,
            temperature: 0.7
          })
        });

        if (!response.ok) throw new Error("Direct OpenAI call failed");
        const data = await response.json();
        return data.choices[0].message.content;
      }
    };

    handleBotCall()
    .then(reply => {
      setIsTyping(false);
      setIsApiConnected(true); // AI successfully connected
      console.log("Smart FIR AI Assistant: Backend response received successfully.");
      
      const replyStr = reply || "";

      // Parse JSON block for FIR Draft in the reply if it exists
      const jsonMatch = replyStr.match(/```json-fir-draft([\s\S]*?)```/);
      let draftData = null;
      let cleanReply = replyStr;

      if (jsonMatch) {
        try {
          draftData = JSON.parse(jsonMatch[1].trim());
          cleanReply = replyStr.replace(jsonMatch[0], "").trim();
        } catch (e) {
          console.error("Error parsing AI-generated FIR JSON draft:", e);
        }
      }

      setChatHistory(prev => [
        ...prev,
        { 
          role: "assistant", 
          text: cleanReply,
          draftData: draftData
        }
      ]);

      if (draftData) {
        // Auto-configure the answers state using details collected by the AI!
        setAnswers(prev => ({
          ...prev,
          complainantName: draftData.complainantName || prev.complainantName,
          complainantPhone: draftData.complainantPhone || prev.complainantPhone,
          incidentLocation: draftData.location || prev.incidentLocation,
          incidentDate: draftData.date || prev.incidentDate,
          incidentDesc: draftData.description || prev.incidentDesc
        }));
        
        if (draftData.category) {
          let safeCategory = "Other";
          const cat = draftData.category || "";
          if (cat.toLowerCase().includes("theft") || cat.toLowerCase().includes("rob")) safeCategory = "Theft / Robbery";
          else if (cat.toLowerCase().includes("cyber") || cat.toLowerCase().includes("fraud")) safeCategory = "Cybercrime / Fraud";
          else if (cat.toLowerCase().includes("assault") || cat.toLowerCase().includes("violen")) safeCategory = "Assault / Violence";
          else if (cat.toLowerCase().includes("harass") || cat.toLowerCase().includes("stalk")) safeCategory = "Harassment / Stalking";
          else if (cat.toLowerCase().includes("accident")) safeCategory = "Accident / Road Incident";
          
          setClassifiedCategory(safeCategory);
          const legalDetails = getLegalSections(safeCategory);
          setSeverity(legalDetails.severity);
        }
      }
    })
    .catch(err => {
      console.error("Smart FIR AI Assistant: API connection failed or encountered error during execution:", err);
      setIsApiConnected(false); // API call failed, switch status to "Basic Guidance Mode"

      // OFFLINE REGEX FALLBACK ENGINE
      setTimeout(() => {
        setIsTyping(false);
        
        // 2. Safe Fallback Response
        let fallbackReply = "AI service is temporarily unavailable. I can still guide you with basic FIR steps. Please describe the incident.";
        if (language === 'hi') {
          fallbackReply = "एआई सेवा अस्थायी रूप से अनुपलब्ध है। मैं अभी भी बुनियादी प्राथमिकी (FIR) चरणों में आपका मार्गदर्शन कर सकता हूँ। कृपया घटना का वर्णन करें।";
        } else if (language === 'mr') {
          fallbackReply = "एआय सेवा तात्पुरती अनुपलब्ध आहे. मी तरीही तुम्हाला मूलभूत एफआयआर (FIR) चरणांमध्ये मदत करू शकतो. कृपया घटनेचे वर्णन करा।";
        }

        let category = "Other";
        if (userText.toLowerCase().includes("stolen") || userText.toLowerCase().includes("theft") || userText.toLowerCase().includes("robbed") || userText.toLowerCase().includes("chori") || userText.toLowerCase().includes("wallet")) {
          category = "Theft / Robbery";
        } else if (userText.toLowerCase().includes("cyber") || userText.toLowerCase().includes("hacked") || userText.toLowerCase().includes("scam") || userText.toLowerCase().includes("money lost") || userText.toLowerCase().includes("fake call")) {
          category = "Cybercrime / Fraud";
        } else if (userText.toLowerCase().includes("assault") || userText.toLowerCase().includes("beat") || userText.toLowerCase().includes("slap") || userText.toLowerCase().includes("fight") || userText.toLowerCase().includes("violence")) {
          category = "Assault / Violence";
        } else if (userText.toLowerCase().includes("harass") || userText.toLowerCase().includes("stalk") || userText.toLowerCase().includes("eve") || userText.toLowerCase().includes("followed")) {
          category = "Harassment / Stalking";
        } else if (userText.toLowerCase().includes("wife") || userText.toLowerCase().includes("domestic") || userText.toLowerCase().includes("husband") || userText.toLowerCase().includes("abuse")) {
          category = "Domestic Violence";
        }

        setClassifiedCategory(category);
        const legalDetails = getLegalSections(category);
        setSeverity(legalDetails.severity);
        
        setAnswers(prev => ({ ...prev, incidentDesc: (prev.incidentDesc + " " + userText).trim() }));

        setChatHistory(prev => [
          ...prev,
          { role: "assistant", text: fallbackReply }
        ]);
      }, 1000);
    });
  };

  const submitChatMessage = (customText = null) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    const newHistory = [...chatHistory, { role: "user", text: textToSend }];
    setChatHistory(newHistory);
    if (!customText) setUserInput('');

    handleBotResponse(textToSend, newHistory);
  };

  const confirmAIClassification = (selectedCat) => {
    setClassifiedCategory(selectedCat);
    setGuidedQuestions(CATEGORY_QUESTIONS[selectedCat] || CATEGORY_QUESTIONS["Other"]);
    setCurrentQuestionIdx(0);
    setCurrentScreen('questions');
  };

  const handleQuestionAnswerSubmit = (value) => {
    const currentQ = guidedQuestions[currentQuestionIdx];
    setAnswers(prev => ({
      ...prev,
      [currentQ.key]: value
    }));

    if (currentQuestionIdx < guidedQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setCurrentScreen('rights');
    }
  };

  // ----------------------------------------------------
  // AUTHENTICATION LOGIC
  // ----------------------------------------------------
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authTab === 'login') {
        await authService.login(email, password);
        setCurrentScreen('dashboard');
      } else if (authTab === 'register') {
        await authService.signUp(email, password, registerName);
        setCurrentScreen('dashboard');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication error.');
    }
  };

  const handleOTPTrigger = (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    setAuthError('');
    alert(`OTP code 123456 sent via SMS to +91-${phone}`);
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    if (otpCode === '123456') {
      try {
        await authService.loginAsGuest();
        setCurrentScreen('dashboard');
      } catch (err) {
        setAuthError(err.message);
      }
    } else {
      setAuthError('Incorrect OTP Code. Use 123456 to simulate.');
    }
  };

  const handleGuestLogin = async () => {
    try {
      await authService.loginAsGuest();
      setCurrentScreen('dashboard');
    } catch (e) {
      setAuthError(e.message);
    }
  };

  const handleLogout = async () => {
    if (isPlayingSiren) triggerAudioSiren();
    await authService.logout();
    setCurrentScreen('auth');
  };

  // ----------------------------------------------------
  // EVIDENCE LOCKER FILE UPLOAD
  // ----------------------------------------------------
  const handleEvidenceUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(5);

    const userId = currentUser ? currentUser.uid : "guest_user";
    storageService.uploadEvidence(
      userId,
      file,
      (progress) => setUploadProgress(progress),
      (downloadUrl) => {
        setIsUploading(false);
        setEvidenceFiles(current => [
          ...current,
          {
            id: Date.now(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.type,
            category: classifiedCategory + " Proof",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            url: downloadUrl
          }
        ]);
        setUploadProgress(0);
      },
      (err) => {
        setIsUploading(false);
        setUploadProgress(0);
        alert("Upload failed. File indexed locally.");
        // Local fallback
        setEvidenceFiles(current => [
          ...current,
          {
            id: Date.now(),
            name: file.name,
            size: (file.size / 1024).toFixed(1) + " KB",
            type: file.type,
            category: classifiedCategory + " Proof",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            url: ""
          }
        ]);
      }
    );
  };

  // Save report to firestore / local
  const saveFIRReportToDatabase = async () => {
    if (!currentUser) return;
    const reportId = "rep_" + Date.now();
    const finalReport = {
      reportId,
      userId: currentUser.uid,
      incidentType: classifiedCategory,
      incidentDate: answers.incidentDate,
      location: answers.incidentLocation,
      description: answers.incidentDesc,
      evidenceUrls: evidenceFiles.map(f => f.url || f.name),
      firDraft: answers
    };

    try {
      await dbService.saveFIRReport(reportId, finalReport);
      fetchSavedReports(currentUser.uid);
    } catch (e) {
      console.error("Error saving report draft:", e);
    }
  };

  // ----------------------------------------------------
  // GOVERNMENT STANDARD PDF DRAFT BUILDER (jsPDF)
  // ----------------------------------------------------
  const exportFIRDraftPDF = () => {
    const doc = new jsPDF();
    const legalDetails = getLegalSections(classifiedCategory);
    const trans = TRANSLATED_COMPLAINT[draftLangTab] || TRANSLATED_COMPLAINT['en'];

    // Official Double Borders
    doc.rect(5, 5, 200, 287);
    doc.rect(6.5, 6.5, 197, 284);

    // Flag Header Strip (Saffron, White, Green strip mock)
    doc.setFillColor(217, 119, 6); // Saffron
    doc.rect(7, 7, 196, 2);
    doc.setFillColor(22, 163, 74); // Green
    doc.rect(7, 9, 196, 2);

    // Official Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(26, 58, 107); // Navy Blue
    doc.text(trans.headerTitle, 105, 22, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(75, 85, 99);
    doc.text(trans.headerSub, 105, 27, { align: "center" });

    // Dividers
    doc.setDrawColor(26, 58, 107);
    doc.setLineWidth(0.5);
    doc.line(15, 31, 195, 31);

    doc.setTextColor(0, 0, 0);

    // Section 1: Precinct area
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text(trans.section1, 15, 39);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(trans.state, 20, 46);
    doc.text(trans.district, 110, 46);
    doc.text(trans.station, 20, 52);
    doc.text(trans.refNo + Date.now().toString().slice(-4), 110, 52);
    
    doc.line(15, 57, 195, 57);

    // Section 2: Complainant
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section2, 15, 65);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`${trans.name} ${answers.complainantName}`, 20, 72);
    doc.text(`${trans.phone} ${answers.complainantPhone}`, 110, 72);
    doc.text(`${trans.city} ${answers.complainantAddress}`, 20, 78);
    
    doc.line(15, 83, 195, 83);

    // Section 3: Incident Details
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section3, 15, 91);
    
    doc.setFont("Helvetica", "normal");
    doc.text(`${trans.incidentDate} ${answers.incidentDate.replace('T', ' ')}`, 20, 98);
    doc.text(`${trans.incidentLoc} ${answers.incidentLocation}`, 20, 104);
    doc.text(`${trans.witness} ${answers.witnessName || 'N/A'}`, 20, 110);
    doc.text(`${trans.accused} ${answers.relationshipAccused || 'Unidentified'}`, 20, 116);
    
    doc.line(15, 121, 195, 121);

    // Section 4: Narrative Text
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section4, 15, 129);
    doc.setFont("Helvetica", "normal");
    const descText = answers.incidentDesc || "Reported incident regarding " + classifiedCategory;
    const splitDesc = doc.splitTextToSize(descText, 175);
    doc.text(splitDesc, 20, 136);

    let currentY = 136 + (splitDesc.length * 5) + 5;
    doc.line(15, currentY, 195, currentY);

    // Section 5: Questionnaire
    currentY += 7;
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section5, 15, currentY);
    doc.setFont("Helvetica", "normal");
    currentY += 7;

    const dynamicQList = CATEGORY_QUESTIONS[classifiedCategory] || [];
    dynamicQList.forEach((qObj) => {
      const answerVal = answers[qObj.key] || "Not provided";
      const qText = `${qObj.q} -> ${answerVal}`;
      const splitQ = doc.splitTextToSize(qText, 175);
      doc.text(splitQ, 20, currentY);
      currentY += (splitQ.length * 5) + 2;
    });

    doc.line(15, currentY, 195, currentY);

    // Section 6: Legal Codification
    currentY += 7;
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section6, 15, currentY);
    doc.setFont("Helvetica", "normal");
    currentY += 6;
    doc.text(`${trans.severity} ${severity}`, 20, currentY);
    currentY += 5;
    doc.text(`${trans.bnsCode} ${legalDetails.bns}`, 20, currentY);
    currentY += 5;
    doc.text(`${trans.ipcCode} ${legalDetails.ipc}`, 20, currentY);
    currentY += 5;

    const splitLegalNote = doc.splitTextToSize(`${trans.note} ${legalDetails.desc}`, 175);
    doc.text(splitLegalNote, 20, currentY);
    currentY += (splitLegalNote.length * 5) + 3;

    doc.line(15, currentY, 195, currentY);

    // Section 7: Evidence
    currentY += 7;
    doc.setFont("Helvetica", "bold");
    doc.text(trans.section7, 15, currentY);
    doc.setFont("Helvetica", "normal");
    currentY += 6;
    evidenceFiles.forEach((file, index) => {
      doc.text(`- ${trans.fileLabel} ${index+1}: ${file.name} (${file.size})`, 20, currentY);
      currentY += 5;
    });

    currentY += 3;
    doc.line(15, currentY, 195, currentY);

    // Declaration & Disclaimer
    currentY += 7;
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    const disclaimerSplit = doc.splitTextToSize(trans.declaration, 175);
    doc.text(disclaimerSplit, 20, currentY);
    
    currentY += 15;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(26, 58, 107);
    doc.text(trans.signatureComplainant, 20, currentY);
    doc.text(trans.signatureOfficer, 130, currentY);

    doc.save(`Smart_FIR_Draft_${draftLangTab.toUpperCase()}.pdf`);
    saveFIRReportToDatabase();
    setCurrentScreen('pdfsuccess');
  };

  // ----------------------------------------------------
  // TEXT-TO-SPEECH READOUT ACCESSIBILITY
  // ----------------------------------------------------
  const speakText = (txt) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(txt);
      if (language === 'hi') utterance.lang = 'hi-IN';
      else if (language === 'mr') utterance.lang = 'mr-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Audio Text-to-speech is not supported on this browser.");
    }
  };

  // Quick Simulation Inputs
  const simulateVoiceInput = () => {
    setIsVoiceRecording(true);
    setTimeout(() => {
      setIsVoiceRecording(false);
      let simulatedText = "A thief snatched my gold ring near Sakinaka metro junction last evening. CCTV cameras are mounted there.";
      setUserInput(simulatedText);
    }, 2500);
  };



  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Scale className="w-12 h-12 text-[#1A3A6B] animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verifying secure citizen credentials...</p>
      </div>
    );
  }

  return (
    <div className="gov-seal-bg min-h-screen pb-16">
      
      {/* ----------------------------------------------------
          NAV BAR & OFFICIAL STATE BANNER
          ---------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-[#1A3A6B] text-white border-b-4 border-[#D97706] shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
            if (currentUser) setCurrentScreen('dashboard');
            else setCurrentScreen('splash');
          }}>
            <div className="flex items-center justify-center w-10 h-10 rounded bg-white text-[#1A3A6B] font-bold shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight m-0 leading-none">
                {text.appName}
              </h1>
              <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider block mt-0.5">National Security Assistant</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Security Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded bg-[#12284C] text-[10px] text-emerald-400 font-mono border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              {text.securityStatus}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#12284C] p-1 rounded border border-white/10">
              {['en', 'hi', 'mr'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 text-xs font-bold rounded uppercase transition-all duration-200 ${
                    language === lang 
                      ? 'bg-[#D97706] text-white' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'ENG' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>



            {/* Main Action buttons */}
            {currentUser && (
              <>
                {currentScreen !== 'dashboard' && (
                  <button
                    onClick={() => {
                      if (currentScreen === 'sos' && isPlayingSiren) triggerAudioSiren();
                      setCurrentScreen('dashboard');
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Portal Home
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-red-800/80 hover:bg-red-800 text-white rounded text-xs font-bold flex items-center gap-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            )}

            {/* EMERGENCY SOS BUTTON */}
            {currentScreen !== 'sos' && (
              <button 
                onClick={() => {
                  setCurrentScreen('sos');
                  if (!isPlayingSiren) triggerAudioSiren();
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded shadow animate-pulse-red flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-white animate-bounce" />
                SOS PANIC
              </button>
            )}

          </div>
        </div>
      </header>



      {/* ----------------------------------------------------
          MAIN SCREEN ROUTER VIEW
          ---------------------------------------------------- */}
      <main className={`max-w-7xl mx-auto px-4 mt-6 ${currentUser ? 'pb-28' : ''}`}>

        {/* 1. SPLASH SCREEN & LANGUAGE SELECTOR */}
        {currentScreen === 'splash' && (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center max-w-xl mx-auto">
            <div className="relative w-28 h-28 mb-6 animate-float flex items-center justify-center rounded-full bg-white shadow-xl border-4 border-[#1A3A6B]">
              <Scale className="w-14 h-14 text-[#1A3A6B]" />
              <Shield className="absolute bottom-1 right-1 w-6 h-6 text-[#D97706]" />
            </div>

            <h2 className="text-3xl font-black tracking-tight text-[#1A3A6B] mb-1">
              {text.appName}
            </h2>
            <p className="text-slate-600 text-sm font-medium mb-8">
              {text.tagline}
            </p>

            <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-4">Select Communication Language / भाषा चुनें</p>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => { setLanguage('en'); }}
                  className={`p-3 rounded-xl border-2 font-bold text-xs ${language === 'en' ? 'border-[#1A3A6B] bg-[#E8EEF5] text-[#1A3A6B]' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => { setLanguage('hi'); }}
                  className={`p-3 rounded-xl border-2 font-bold text-xs ${language === 'hi' ? 'border-[#1A3A6B] bg-[#E8EEF5] text-[#1A3A6B]' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  हिंदी
                </button>
                <button 
                  onClick={() => { setLanguage('mr'); }}
                  className={`p-3 rounded-xl border-2 font-bold text-xs ${language === 'mr' ? 'border-[#1A3A6B] bg-[#E8EEF5] text-[#1A3A6B]' : 'border-slate-200 hover:bg-slate-50'}`}
                >
                  मराठी
                </button>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 font-mono italic mb-4">
              {text.splashLoading}
            </p>

            <button 
              onClick={() => {
                if (currentUser) setCurrentScreen('dashboard');
                else setCurrentScreen('auth');
              }} 
              className="cyber-btn-blue w-full py-3.5 rounded-xl text-sm font-black flex items-center justify-center gap-1.5 shadow"
            >
              {text.quickLaunch} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. AUTHENTICATION SCREENS */}
        {currentScreen === 'auth' && (
          <div className="max-w-md mx-auto">
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mt-8">
              
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  onClick={() => { setAuthTab('login'); setAuthError(''); }}
                  className={`flex-1 py-3 text-xs font-black uppercase border-b-2 transition-all ${authTab === 'login' ? 'border-[#1A3A6B] text-[#1A3A6B] bg-white' : 'border-transparent text-slate-500'}`}
                >
                  Email Login
                </button>
                <button
                  onClick={() => { setAuthTab('register'); setAuthError(''); }}
                  className={`flex-1 py-3 text-xs font-black uppercase border-b-2 transition-all ${authTab === 'register' ? 'border-[#1A3A6B] text-[#1A3A6B] bg-white' : 'border-transparent text-slate-500'}`}
                >
                  New Account
                </button>
                <button
                  onClick={() => { setAuthTab('otp'); setAuthError(''); setOtpSent(false); }}
                  className={`flex-1 py-3 text-xs font-black uppercase border-b-2 transition-all ${authTab === 'otp' ? 'border-[#1A3A6B] text-[#1A3A6B] bg-white' : 'border-transparent text-slate-500'}`}
                >
                  Mobile OTP
                </button>
              </div>

              <div className="p-6">
                
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                  <Key className="w-5 h-5 text-[#1A3A6B]" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Citizen Credentials Portal</h3>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl mb-4 font-semibold">
                    {authError}
                  </div>
                )}

                {/* Email Login/Register Forms */}
                {(authTab === 'login' || authTab === 'register') && (
                  <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                    {authTab === 'register' && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Citizen Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="e.g., Ramesh Kumar" 
                          className="w-full glass-input"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., ramesh@smartfir.in" 
                        className="w-full glass-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full glass-input"
                      />
                    </div>

                    <button type="submit" className="cyber-btn-blue w-full py-3 rounded-xl mt-2 text-xs uppercase font-bold">
                      {authTab === 'login' ? 'Login Securely' : 'Register Account'}
                    </button>
                  </form>
                )}

                {/* Mobile OTP Form */}
                {authTab === 'otp' && (
                  <div className="flex flex-col gap-4">
                    {!otpSent ? (
                      <form onSubmit={handleOTPTrigger} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Phone Number (10-Digit)</label>
                          <div className="flex">
                            <span className="bg-slate-100 border border-slate-300 px-3 py-2 text-slate-500 rounded-l-lg text-xs font-bold flex items-center">+91</span>
                            <input 
                              type="tel" 
                              required
                              maxLength="10"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="9876543210" 
                              className="w-full glass-input rounded-l-none!"
                            />
                          </div>
                        </div>
                        <button type="submit" className="cyber-btn-blue w-full py-3 rounded-xl text-xs uppercase font-bold">
                          Send Verification Code
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleOTPVerify} className="flex flex-col gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Enter 6-Digit OTP Code</label>
                          <input 
                            type="text" 
                            required
                            maxLength="6"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Use 123456 to verify" 
                            className="w-full glass-input text-center text-lg tracking-widest font-bold"
                          />
                        </div>
                        <button type="submit" className="cyber-btn-blue w-full py-3 rounded-xl text-xs uppercase font-bold">
                          Verify & Continue
                        </button>
                      </form>
                    )}
                  </div>
                )}

                <div className="border-t border-slate-100 my-5 pt-4 text-center">
                  <p className="text-[10px] text-slate-400 mb-3">No account required? Save reports temporarily</p>
                  <button 
                    onClick={handleGuestLogin}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                  >
                    Proceed in Guest Mode
                  </button>
                </div>

              </div>

            </div>

            <button 
              onClick={() => setCurrentScreen('splash')}
              className="text-xs text-slate-500 hover:text-[#1A3A6B] flex items-center gap-1.5 mx-auto mt-6 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Welcome Screen
            </button>

          </div>
        )}

        {/* 3. HOME DASHBOARD */}
        {currentScreen === 'dashboard' && (
          <div>
            
            {/* Top State Profile Ribbon */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded bg-[#E8EEF5] text-[#1A3A6B] flex items-center justify-center border border-[#1A3A6B]/20 shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-tight flex items-center gap-1.5">
                    {userProfile.name || "Anonymous Citizen"} 
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      {currentUser?.isAnonymous ? 'Guest session' : 'Verified Profile'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{text.activeLocation}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {userProfile.phone && (
                  <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-lg font-mono">
                    Phone: {userProfile.phone}
                  </span>
                )}
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg font-mono font-bold">
                  Storage: {authService.isFirebaseActive() ? 'Secure Cloud Sync' : 'Secure Local Offline'}
                </span>
              </div>
            </div>

            {/* Core Interactive Portal Layout */}
            <div className="dashboard-grid">
              
              {/* LEFT COLUMN: Actions & Tools */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                
                {/* Large Start Legal Assistant Card */}
                <div className="bg-white border-2 border-[#1A3A6B] p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.03] text-[#1A3A6B] pointer-events-none">
                    <Scale className="w-48 h-48" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#E8EEF5] text-[#1A3A6B] flex items-center justify-center border border-[#1A3A6B]/20 shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#1A3A6B]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-800">{text.startAssistant}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-lg">
                        Our intelligent assistant helps you construct a legally sound complaint draft. The chatbot assesses your input, matches it to proper BNS and IPC codes, guides you through necessary details, and compiles a download-ready copy.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setChatHistory([
                        { 
                          role: "assistant", 
                          text: "Jai Hind! I am your supportive Legal Companion. I am here to guide you through the process of generating an FIR complaint draft or explaining your legal rights.\n\n*Safety Note: I will never ask for your passwords, bank codes, or Aadhaar number. Please describe the legal incident that occurred.*" 
                        }
                      ]);
                      setCurrentScreen('chat');
                    }}
                    className="cyber-btn-blue px-6 py-3 rounded-xl text-xs uppercase font-bold shrink-0 shadow flex items-center gap-1.5"
                  >
                    Start AI Guide <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Step-by-Step Guided FIR Wizard Launch Card */}
                <div className="bg-gradient-to-r from-[#1A3A6B] to-[#0E2347] border border-[#1A3A6B] p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-[0.06] text-white pointer-events-none">
                    <Scale className="w-48 h-48" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20 shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-black text-white">
                          {language === 'en' ? 'Step-by-Step Guided FIR Wizard' : language === 'hi' ? 'चरण-दर-चरण एफआईआर विज़ार्ड' : 'मार्गदर्शित एफआयआर विझार्ड'}
                        </h4>
                        <span className="text-[8px] bg-amber-400 text-amber-900 font-black px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed max-w-lg">
                        {language === 'en'
                          ? 'File a structured complaint in 8 easy steps. Select complaint type, describe incident, upload evidence, get BNS 2023 legal section suggestions and download a ready-to-submit PDF draft.'
                          : 'आसान 8 चरणों में संरचित शिकायत दर्ज करें। अपराध का प्रकार, स्थान, गवाह, और BNS 2023 धाराएं स्वचालित रूप से सुझाई जाती हैं।'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setWizardCategory(null);
                      setWizardStep(1);
                      setWizardForm({
                        incidentDesc: '',
                        incidentDate: new Date().toISOString().slice(0, 16),
                        incidentLocation: '',
                        stolenItems: '',
                        estimatedValue: '',
                        transactionId: '',
                        platformName: '',
                        complainantName: '',
                        complainantPhone: '',
                        complainantAddress: '',
                        accusedDesc: '',
                        witnessName: ''
                      });
                      setCurrentScreen('stepwizard');
                    }}
                    className="bg-white hover:bg-slate-100 text-[#1A3A6B] px-6 py-3 rounded-xl text-xs uppercase font-black shrink-0 shadow flex items-center gap-1.5 transition-all"
                  >
                    {language === 'en' ? 'Start Wizard' : 'विज़ार्ड शुरू करें'} <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Evidence Locker Widget */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                      <Lock className="w-4.5 h-4.5 text-[#1A3A6B]" />
                      {text.lockerTitle}
                    </h4>
                    <span className="text-[9px] text-[#1A3A6B] font-bold px-2 py-0.5 rounded bg-[#E8EEF5]">
                      {evidenceFiles.length} FILES ENCRYPTED
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-4">
                    Store screenshots of chats, payment receipts, receipts, or photos securely. Uploaded files are logged and indexed to your final FIR draft.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {evidenceFiles.map(file => (
                      <div key={file.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-8 h-8 rounded bg-[#E8EEF5] text-[#1A3A6B] flex items-center justify-center shrink-0">
                            <FileText className="w-4.5 h-4.5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{file.size} &bull; {file.category}</p>
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setCurrentScreen('locker')}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    Open Evidence Locker Vault <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Saved FIR drafts collection */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                      <FileText className="w-4.5 h-4.5 text-[#1A3A6B]" />
                      My Saved Drafts & History
                    </h4>
                    <span className="text-[9px] text-[#1A3A6B] font-bold px-2 py-0.5 rounded bg-[#E8EEF5]">
                      {savedReports.length} DRAFTS SAVED
                    </span>
                  </div>

                  {reportsLoading ? (
                    <p className="text-xs text-slate-400 py-3 italic">Loading saved files...</p>
                  ) : savedReports.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center italic">No drafts saved yet. Complete a guided chatbot flow to save your complaint.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {savedReports.map((rep) => (
                        <div key={rep.reportId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-800">{rep.incidentType} Draft</span>
                              <span className="text-[8px] bg-[#E8EEF5] text-[#1A3A6B] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                                Sec {getLegalSections(rep.incidentType).bns.split(" ")[1]} BNS
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono">Location: {rep.location} &bull; Date: {rep.incidentDate.replace('T', ' ')}</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setAnswers(rep.firDraft);
                              setClassifiedCategory(rep.incidentType);
                              setCurrentScreen('preview');
                            }}
                            className="px-3 py-1.5 bg-[#1A3A6B] hover:bg-[#12284C] text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Draft
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Locator maps & Citizen Rights */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                
                {/* Station Locator Map Widget */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                      <MapPin className="w-4.5 h-4.5 text-[#1A3A6B]" />
                      {text.locatorTitle}
                    </h4>
                    <span className="text-[9px] text-slate-500 font-mono font-bold">MAPPED (5KM)</span>
                  </div>

                  {/* Google Maps Embed iframe (Query mock coordinates of Sakinaka for display) */}
                  <div className="relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200">
                    <iframe
                      title="Sakinaka Police Station Map"
                      width="100%"
                      height="144"
                      frameBorder="0" 
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey || 'AIzaSyDummyKeyForStaticFallback'}&q=Sakinaka+Police+Station,Mumbai+Maharashtra&zoom=14`}
                      allowFullScreen
                      className="absolute inset-0"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[8px] font-mono px-2 py-0.5 rounded">
                      GPS Center Sakinaka Active
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-700">Sakinaka Police Precinct</p>
                        <p className="text-[9px] text-slate-400">Distance: 0.8 km &bull; Nearest Station</p>
                      </div>
                      <Phone className="w-3.5 h-3.5 text-[#1A3A6B] cursor-pointer" onClick={() => alert("Calling Sakinaka Police control: +91-22-28522222")} />
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-rose-800">Women Police Cell</p>
                        <p className="text-[9px] text-slate-400">Distance: 2.5 km &bull; Ghatkopar Division</p>
                      </div>
                      <Phone className="w-3.5 h-3.5 text-rose-700 cursor-pointer" onClick={() => alert("Calling Women cell: +91-22-25113333")} />
                    </div>
                  </div>

                  <button 
                    onClick={() => setCurrentScreen('locator')}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    Open Interactive Maps <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Citizen Rights Handbook */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h4 className="text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                      <Scale className="w-4.5 h-4.5 text-[#1A3A6B]" />
                      {text.rightsHandbook}
                    </h4>
                    <span className="text-[9px] text-[#1A3A6B] font-bold">BNS / IPC</span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Knowing your baseline rights ensures quick action at any local police station:
                  </p>

                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <h5 className="text-xs font-bold text-[#1A3A6B] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Right to Free FIR Copy
                      </h5>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Under Section 154(2) of CrPC, police are legally bound to supply you a complete, certified physical copy of the FIR immediately for free.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <h5 className="text-xs font-bold text-[#1A3A6B] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Zero FIR Right
                      </h5>
                      <p className="text-[9px] text-slate-400 mt-1">
                        You can file an FIR at any police station regardless of jurisdiction. It will be recorded as 'Zero' number and later forwarded to correct precinct.
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Edit Profile Form (Save profile Details) */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#1A3A6B]" />
                    Edit Citizen Profile
                  </h4>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Complainant Name</label>
                      <input 
                        type="text" 
                        value={userProfile.name}
                        onChange={(e) => {
                          const updated = { ...userProfile, name: e.target.value };
                          setUserProfile(updated);
                          if (currentUser) dbService.saveUser(currentUser.uid, updated);
                        }}
                        className="w-full glass-input py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">Mobile Phone</label>
                      <input 
                        type="text" 
                        value={userProfile.phone}
                        onChange={(e) => {
                          const updated = { ...userProfile, phone: e.target.value };
                          setUserProfile(updated);
                          if (currentUser) dbService.saveUser(currentUser.uid, updated);
                        }}
                        className="w-full glass-input py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-slate-500 uppercase mb-0.5">City/Address</label>
                      <input 
                        type="text" 
                        value={userProfile.city}
                        onChange={(e) => {
                          const updated = { ...userProfile, city: e.target.value };
                          setUserProfile(updated);
                          if (currentUser) dbService.saveUser(currentUser.uid, updated);
                        }}
                        className="w-full glass-input py-1.5 text-xs"
                      />
                    </div>
                    <p className="text-[8px] text-slate-400 italic">Changes are saved instantly in your profile record.</p>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 4. AI CHAT COMPANION */}
        {currentScreen === 'chat' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">

            {/* Left Column: Chat History & Input */}
            <div className="lg:col-span-9 flex flex-col h-[600px] bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              
              {/* Chat header */}
              <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between gap-3 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8EEF5] flex items-center justify-center border border-[#1A3A6B]/20 text-[#1A3A6B]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Smart FIR AI Assistant</h4>
                    {isApiConnected ? (
                      <span className="text-[9px] text-green-600 font-bold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div> AI Connected &bull; Multilingual Guidance
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> Basic Guidance Mode &bull; Multilingual
                      </span>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => speakText("Jai Hind! Describe the legal incident, and I will assist in drafting your FIR copy.")}
                  className="p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#1A3A6B]"
                  title="Speak Assist Audio"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6 flex flex-col gap-6 custom-scrollbar">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center opacity-85 my-auto">
                    <div className="w-14 h-14 bg-[#E8EEF5] rounded-2xl flex items-center justify-center mb-4 border border-[#1A3A6B]/20 text-[#1A3A6B]">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 text-sm">Smart FIR AI Assistant</h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Describe the offense or incident in natural language. The AI will guide you step by step to generate your formal FIR draft copy.</p>
                  </div>
                )}

                {chatHistory.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'} z-10`}
                  >
                    <div className={`p-3.5 px-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-[#1A3A6B] text-white font-semibold rounded-tr-none shadow-sm' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text.split('\n').map((para, k) => (
                        <p key={k} className={k > 0 ? "mt-2" : ""}>{para}</p>
                      ))}

                      {/* AI Draft readiness block */}
                      {msg.draftData && msg.draftData.isReady && (
                        <div className="mt-4 p-3 bg-green-50/50 border border-green-500/30 shadow-sm rounded-xl text-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">FIR DRAFT STATUS:</span>
                            <span className="text-[9.5px] font-black text-green-700 px-2 py-0.5 rounded bg-green-100 border border-green-200">
                              FIR-READY COMPLAINT GENERATED
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 mb-3 font-medium">All critical information has been successfully collected by the AI Assistant.</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setGuidedQuestions(CATEGORY_QUESTIONS[msg.draftData.category] || CATEGORY_QUESTIONS["Other"]);
                                setCurrentScreen('preview');
                              }}
                              className="bg-green-700 hover:bg-green-800 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                            >
                              Proceed to FIR Preview <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[8px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
                      {msg.role === 'user' ? 'Citizen' : 'Smart FIR AI'}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="self-start flex items-center gap-3 p-3 px-4 rounded-2xl bg-white border border-slate-200 rounded-tl-none shadow-sm max-w-[75%] z-10 shrink-0">
                    <div className="flex gap-1 shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A6B] animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A6B] animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A6B] animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                    <span className="text-[11px] text-[#1A3A6B] font-bold">Smart FIR Assistant is typing...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Warning Card inside sticky input panel */}
              {showWarning && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-start gap-2.5 text-xs text-red-800 shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-800 uppercase tracking-wider">{text.warningTitle}</h5>
                    <p className="mt-0.5 leading-normal">{text.warningAadhaar}</p>
                  </div>
                  <button onClick={() => setShowWarning(false)} className="text-slate-400 hover:text-slate-600 shrink-0 ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sticky Bottom Panel */}
              <div className="bg-white border-t border-slate-100 p-4 shrink-0 flex flex-col gap-3">
                
                {/* Quick Suggestions Chips */}
                <div className="flex flex-wrap gap-2 pb-1 max-h-16 custom-scrollbar shrink-0">
                  <button 
                    onClick={() => submitChatMessage("My phone was stolen")}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm transition-all"
                  >
                    My phone was stolen
                  </button>
                  <button 
                    onClick={() => submitChatMessage("Online fraud happened")}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm transition-all"
                  >
                    Online fraud happened
                  </button>
                  <button 
                    onClick={() => submitChatMessage("I am being harassed")}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm transition-all"
                  >
                    I am being harassed
                  </button>
                  <button 
                    onClick={() => submitChatMessage("Accident happened")}
                    className="px-3.5 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm transition-all"
                  >
                    Accident happened
                  </button>
                </div>

                {/* Input box */}
                <div className="flex gap-3 items-center shrink-0">
                  <button 
                    onClick={simulateVoiceInput}
                    className={`p-3.5 rounded-2xl border transition-all shrink-0 ${
                      isVoiceRecording 
                        ? 'bg-red-600 border-red-600 text-white animate-pulse' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-[#1A3A6B] hover:bg-slate-100'
                    }`}
                    title={text.voiceInputClick}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitChatMessage()}
                    placeholder={text.enterMessage}
                    className="w-full glass-input"
                  />

                  <button 
                    onClick={() => submitChatMessage()}
                    className="bg-[#1A3A6B] hover:bg-[#12284C] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase shrink-0 transition-colors"
                  >
                    {text.send}
                  </button>
                </div>

                {/* Navigation Back button */}
                <div className="text-center pt-1 border-t border-slate-50 shrink-0">
                  <button 
                    onClick={() => setCurrentScreen('dashboard')}
                    className="text-xs text-slate-500 hover:text-[#1A3A6B] flex items-center gap-1.5 mx-auto transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> {text.backToDashboard}
                  </button>
                </div>

              </div>

            </div>

            {/* Right Column: Compact Readiness Sidebar */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                <div className="border-b border-slate-100 pb-2 mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Readiness Dashboard</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-black text-slate-800">{getCompleteness()}% Complete</span>
                  </div>
                  
                  {/* Horizontal progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                    <div className="bg-[#1A3A6B] h-1.5 rounded-full transition-all duration-500" style={{ width: getCompleteness() + '%' }}></div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                    <span className="text-slate-600 font-bold">Complainant Profile</span>
                    {(userProfile.name && userProfile.name !== "Anonymous Citizen") ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                    <span className="text-slate-600 font-bold">Incident Date/Time</span>
                    {(answers.incidentDate && !answers.incidentDate.includes("T")) ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                    <span className="text-slate-600 font-bold">Place of Occurrence</span>
                    {(answers.incidentLocation && answers.incidentLocation !== "Sakinaka metro junction, Mumbai") ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                    <span className="text-slate-600 font-bold">Detailed Statement</span>
                    {(answers.incidentDesc && answers.incidentDesc.length >= 15) ? <Check className="w-4 h-4 text-emerald-500 font-bold" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                <h4 className="text-[10px] font-black text-slate-800 pb-2 mb-3 border-b border-slate-100 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Detected Missing Info
                </h4>
                {getMissingFields().length === 0 ? (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100"><Check className="w-4 h-4" /> All critical fields successfully logged.</p>
                ) : (
                  <ul className="flex flex-col gap-2.5">
                    {getMissingFields().map((f, idx) => (
                      <li key={idx} className="text-[10px] text-slate-700 flex items-start gap-2 p-2 bg-amber-50/60 rounded border border-amber-100/60 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1"></span>
                        <span>Please mention the <strong>{f}</strong> in your statement.</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 5. UNIFIED STEP-BY-STEP FIR WIZARD */}
        {currentScreen === 'stepwizard' && (
          <div className="max-w-4xl mx-auto text-left">
            {/* Header: Title and Top Step Bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">
                  {language === 'en' ? 'Guided FIR Wizard' : language === 'hi' ? 'प्राथमिकी विज़ार्ड' : 'मार्गदर्शित एफआयआर सहाय्यक'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'en' ? 'Complete the steps below to draft a legally compliant complaint' : 'एक वैध कानूनी शिकायत पत्र का मसौदा तैयार करने के लिए चरणों को पूरा करें'}
                </p>
              </div>
              
              {/* Progress pill */}
              <div className="flex items-center gap-2 bg-[#E8EEF5] px-3.5 py-1.5 rounded-xl border border-[#1A3A6B]/15 text-xs font-black text-[#1A3A6B] shrink-0 font-mono">
                {wizardCategory === null ? (
                  <span>STEP 1 OF 8</span>
                ) : (
                  <span>STEP {wizardStep} OF 8</span>
                )}
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-8 border border-slate-200/50 flex">
              <div 
                className="bg-[#1A3A6B] h-full transition-all duration-500" 
                style={{ width: `${((wizardCategory === null ? 1 : wizardStep) / 8) * 100}%` }}
              ></div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col justify-between">
              
              {/* ----------------------------------------------------
                    STEP 1: SELECT COMPLAINT TYPE
                    ---------------------------------------------------- */}
              {wizardCategory === null && (
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6">
                    {language === 'en' ? 'Step 1: Select Complaint Category' : 'चरण 1: शिकायत की श्रेणी चुनें'}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'Theft', icon: Layers, label: language === 'en' ? 'Theft' : 'चोरी', desc: 'Stolen wallet, jewelry, cash or household items' },
                      { id: 'Mobile theft', icon: Lock, label: language === 'en' ? 'Mobile Theft' : 'मोबाइल चोरी', desc: 'Device lost, snatched or pickpocketed in public' },
                      { id: 'Assault', icon: Shield, label: language === 'en' ? 'Assault / Hurt' : 'हमला / चोट', desc: 'Physical violence, battery or physical dispute' },
                      { id: 'Harassment', icon: User, label: language === 'en' ? 'Harassment' : 'उत्पीड़न', desc: 'Stalking, modesty insult or domestic abuse' },
                      { id: 'Cyber crime', icon: Lock, label: language === 'en' ? 'Cyber Fraud' : 'साइबर अपराध', desc: 'UPI fraud, phishing, online threats or scams' },
                      { id: 'Missing person', icon: User, label: language === 'en' ? 'Missing Person' : 'लापता व्यक्ति', desc: 'Reports for missing family members or relatives' },
                      { id: 'Accident', icon: Scale, label: language === 'en' ? 'Road Accident' : 'सड़क दुर्घटना', desc: 'Vehicular collision or negligent rash driving' },
                      { id: 'Other', icon: Layers, label: language === 'en' ? 'Other / Custom' : 'अन्य शिकायत', desc: 'Property disputes, public nuisance or custom reports' }
                    ].map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <div 
                          key={card.id}
                          className="p-5 border border-slate-200 rounded-2xl hover:border-[#1A3A6B] hover:shadow-md transition-all flex flex-col justify-between gap-4 text-left group bg-slate-50/50"
                        >
                          <div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#1A3A6B] flex items-center justify-center border border-slate-200 group-hover:bg-[#E8EEF5] transition-all">
                              <CardIcon className="w-5 h-5 text-[#1A3A6B]" />
                            </div>
                            <h4 className="font-black text-slate-800 text-sm mt-3">{card.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal">{card.desc}</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setWizardCategory(card.id);
                              setWizardStep(2);
                            }}
                            className="w-full py-2 bg-slate-100 group-hover:bg-[#1A3A6B] group-hover:text-white text-slate-700 text-[10px] font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 uppercase"
                          >
                            <span>Start FIR</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 2: INCIDENT DETAILS
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Layers className="w-4 h-4 text-[#1A3A6B]" />
                    <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                      {language === 'en' ? 'Step 2: Incident Details Statement' : 'चरण 2: घटना का संक्षिप्त विवरण'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5 leading-normal">
                        {language === 'en' 
                          ? '1. What happened? Describe the incident in simple plain language:' 
                          : '१. क्या हुआ था? घटना का विवरण सरल शब्दों में लिखें:'}
                      </label>
                      <textarea
                        value={wizardForm.incidentDesc || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, incidentDesc: e.target.value }))}
                        rows={5}
                        placeholder={language === 'en' ? 'Provide a clear explanation including sequence of events, what was said, etc.' : 'घटनाक्रम और बातचीत सहित स्पष्ट विवरण दर्ज करें।'}
                        className="w-full p-4 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A6B] focus:border-[#1A3A6B]"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-750 mb-1.5">
                          {language === 'en' ? '2. Approximate Date and Time:' : '२. घटना की अनुमानित तिथि और समय:'}
                        </label>
                        <input
                          type="datetime-local"
                          value={wizardForm.incidentDate || ''}
                          onChange={(e) => setWizardForm(prev => ({ ...prev, incidentDate: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A6B]"
                        />
                      </div>
                      
                      {/* Theft Specific Fields */}
                      {(wizardCategory === 'Theft' || wizardCategory === 'Mobile theft') && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-750 mb-1.5">
                              {language === 'en' ? 'Stolen Item Description:' : 'चोरी की गई वस्तुओं का विवरण:'}
                            </label>
                            <input
                              type="text"
                              value={wizardForm.stolenItems || ''}
                              onChange={(e) => setWizardForm(prev => ({ ...prev, stolenItems: e.target.value }))}
                              placeholder={language === 'en' ? 'e.g. iPhone 15 Blue, Leather Wallet' : 'उदा. आईफोन १५, चमड़े का बटुआ'}
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-750 mb-1.5">
                              {language === 'en' ? 'Estimated Total Value (INR):' : 'अनुमानित कुल मूल्य (रुपये):'}
                            </label>
                            <input
                              type="number"
                              value={wizardForm.estimatedValue || ''}
                              onChange={(e) => setWizardForm(prev => ({ ...prev, estimatedValue: e.target.value }))}
                              placeholder="e.g. 50000"
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                            />
                          </div>
                        </>
                      )}

                      {/* Cyber Specific Fields */}
                      {wizardCategory === 'Cyber crime' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-750 mb-1.5">
                              {language === 'en' ? 'Transaction Reference ID (UPI/Bank):' : 'लेनदेन संदर्भ आईडी (UPI/बैंक):'}
                            </label>
                            <input
                              type="text"
                              value={wizardForm.transactionId || ''}
                              onChange={(e) => setWizardForm(prev => ({ ...prev, transactionId: e.target.value }))}
                              placeholder="e.g. TXN987216238"
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-750 mb-1.5">
                              {language === 'en' ? 'Platform Name:' : 'प्लेटफार्म का नाम:'}
                            </label>
                            <input
                              type="text"
                              value={wizardForm.platformName || ''}
                              onChange={(e) => setWizardForm(prev => ({ ...prev, platformName: e.target.value }))}
                              placeholder="e.g. Google Pay, WhatsApp"
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 3: LOCATION DETAILS
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4 text-[#1A3A6B]" />
                    <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                      {language === 'en' ? 'Step 3: Location Details & Jurisdiction' : 'चरण 3: घटना का स्थान और अधिकार क्षेत्र'}
                    </h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Incident Occurrence Location:' : 'घटना का विशिष्ट स्थान / पता:'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.incidentLocation || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, incidentLocation: e.target.value }))}
                        placeholder={language === 'en' ? 'Precise location name, street, nearby landmarks' : 'सटीक स्थान, गली, पास के लैंडमार्क'}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1A3A6B]"
                      />
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left">
                      <h4 className="text-[10px] font-black text-[#1A3A6B] uppercase tracking-wider mb-2">
                        Precinct Station Map Redirection
                      </h4>
                      <p className="text-[10.5px] text-slate-500 leading-normal mb-4">
                        For official filing, the complaint must resolve to the police station having local jurisdiction over the location. Use locator on bottom navigation bar for real-time precinct GPS mapping.
                      </p>
                      
                      <button
                        onClick={() => setCurrentScreen('locator')}
                        className="px-4 py-2 bg-[#1A3A6B] hover:bg-[#12284C] text-white text-[10.5px] font-black rounded-lg flex items-center gap-1 shadow-sm transition-all uppercase"
                      >
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        Open Precinct Locator
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 4: COMPLAINANT / VICTIM DETAILS
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 4 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-4 h-4 text-[#1A3A6B]" />
                    <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                      {language === 'en' ? 'Step 4: Complainant / Victim Profile' : 'चरण 4: शिकायतकर्ता / पीड़ित का विवरण'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Full Name:' : 'पूरा नाम:'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.complainantName || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, complainantName: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Phone Number:' : 'फोन नंबर:'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.complainantPhone || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, complainantPhone: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Residential Address:' : 'आवासीय पता:'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.complainantAddress || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, complainantAddress: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 5: SUSPECT AND WITNESS INFO
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 5 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-4 h-4 text-[#1A3A6B]" />
                    <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                      {language === 'en' ? 'Step 5: Suspect and Witness Information' : 'चरण 5: संदिग्ध और गवाह की जानकारी'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Accused / Suspect Details (if known):' : 'आरोपी / संदिग्ध का विवरण (यदि ज्ञात हो):'}
                      </label>
                      <textarea
                        value={wizardForm.accusedDesc || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, accusedDesc: e.target.value }))}
                        rows={3}
                        placeholder={language === 'en' ? 'Describe physical features, clothing, accent, vehicle or name.' : 'शारीरिक बनावट, पहनावा, लहजा, वाहन या नाम का वर्णन करें।'}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-750 mb-1.5">
                        {language === 'en' ? 'Witnesses Name and Contact (if any):' : 'गवाहों का नाम और संपर्क (यदि कोई हो):'}
                      </label>
                      <input
                        type="text"
                        value={wizardForm.witnessName || ''}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, witnessName: e.target.value }))}
                        placeholder={language === 'en' ? 'e.g. Ramesh Kumar (+91 9876543210)' : 'उदा. रमेश कुमार (+91 9876543210)'}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 6: EVIDENCE UPLOAD TIMELINE
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 6 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Upload className="w-4 h-4 text-[#1A3A6B]" />
                    <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                      {language === 'en' ? 'Step 6: Secure Evidence Locker Upload' : 'चरण 6: साक्ष्य लॉकर में अपलोड करें'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border-2 border-dashed border-[#1A3A6B]/30 p-6 rounded-2xl text-center flex flex-col items-center justify-center min-h-[180px]">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="relative w-10 h-10 mb-2 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-t-[#1A3A6B] animate-spin"></div>
                            <span className="text-[8px] text-[#1A3A6B] font-bold font-mono">{uploadProgress}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold">Encrypting & Storing...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#1A3A6B]/40 mb-2 animate-bounce" />
                          <h4 className="text-xs font-bold text-slate-700">{language === 'en' ? 'Attach File Proof' : 'साक्ष्य फ़ाइल संलग्न करें'}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 mb-4 max-w-[150px]">{language === 'en' ? 'Supports receipts, chats, call recordings, etc.' : 'रसीद, स्क्रीनशॉट, कॉल रिकॉर्डिंग आदि।'}</p>
                          
                          <label className="px-4 py-2 bg-[#1A3A6B] hover:bg-[#12284C] text-white rounded-xl text-[10px] font-black cursor-pointer shadow transition-all uppercase">
                            {language === 'en' ? 'Upload' : 'अपलोड'}
                            <input 
                              type="file" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 10 * 1024 * 1024) {
                                  alert("File size exceeds 10MB limit!");
                                  return;
                                }
                                setIsUploading(true);
                                setUploadProgress(10);
                                let p = 10;
                                const interval = setInterval(() => {
                                  p += 30;
                                  if (p >= 100) {
                                    clearInterval(interval);
                                    setIsUploading(false);
                                    setUploadProgress(0);
                                    const newFile = {
                                      id: Date.now(),
                                      name: file.name,
                                      size: (file.size / 1024).toFixed(1) + " KB",
                                      category: "Wizard Evidence",
                                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    };
                                    setEvidenceFiles(prev => [...prev, newFile]);
                                    alert("Evidence File secured!");
                                  } else {
                                    setUploadProgress(p);
                                  }
                                }, 300);
                              }}
                              className="hidden" 
                            />
                          </label>
                        </>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-655 uppercase tracking-wider mb-3">
                          Uploaded Evidentiary Files
                        </h4>
                        
                        <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                          {evidenceFiles.map(file => (
                            <div key={file.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-[10.5px]">
                              <div className="truncate pr-2">
                                <p className="font-bold text-slate-700 truncate">{file.name}</p>
                                <p className="text-[8.5px] text-slate-400">Size: {file.size} &bull; Secured</p>
                              </div>
                              <span className="text-[8px] text-emerald-700 font-bold uppercase shrink-0">ENCRYPTED</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-[9px] text-[#1A3A6B] font-bold mt-2">
                        AES-255 Vault Protocol active. All files are encrypted.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 7: REVIEW FIR DRAFT & BNS SUGGESTIONS
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-[#1A3A6B]" />
                      <h3 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">
                        {language === 'en' ? 'Step 7: BNS 2023 Suggested Sections & Draft Review' : 'चरण 7: बीएनएस २०२३ शिफारस अनुभाग और पूर्वावलोकन'}
                      </h3>
                    </div>
                    <p className="text-[10.5px] text-slate-500">
                      Based on AI Incident Categorization, the following legal sections from Bharatiya Nyaya Sanhita (BNS), 2023 / IPC apply:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BNS suggestion cards */}
                    <div className="space-y-3">
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase">
                        AI Recommended BNS Legal Sections
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(() => {
                          const details = getLegalSections(wizardCategory);
                          let suggestions = [];
                          if (wizardCategory === 'Theft' || wizardCategory === 'Mobile theft') {
                            suggestions = [
                              { sec: "Section 303 BNS", title: "Standard Theft", desc: "For stealing of movable items (phone, wallet, cash)." },
                              { sec: "Section 305 BNS", title: "Theft in Dwelling", desc: "Theft inside a residential space or premises." },
                              { sec: "Section 307 BNS", title: "Snatching", desc: "Forcible snatching directly from hands." }
                            ];
                          } else if (wizardCategory === 'Assault') {
                            suggestions = [
                              { sec: "Section 115 BNS", title: "Voluntarily Causing Hurt", desc: "Leading to physical injury or physical bruises." },
                              { sec: "Section 117 BNS", title: "Grievous Hurt", desc: "Severe bodily injuries, fractures or cuts." }
                            ];
                          } else if (wizardCategory === 'Harassment') {
                            suggestions = [
                              { sec: "Section 78 BNS", title: "Stalking", desc: "Following, cyber monitoring, or repetitive stalking." },
                              { sec: "Section 79 BNS", title: "Insulting Modesty", desc: "Verbal insults or obscene gestures toward a woman." }
                            ];
                          } else if (wizardCategory === 'Cyber crime') {
                            suggestions = [
                              { sec: "Section 318 BNS", title: "Cheating by Phishing", desc: "Online money frauds or fraudulent UPI transactions." },
                              { sec: "Section 319 BNS", title: "Personation Fraud", desc: "Impersonating bank, official, or profiles online." }
                            ];
                          } else if (wizardCategory === 'Accident') {
                            suggestions = [
                              { sec: "Section 281 BNS", title: "Rash & Negligent Driving", desc: "Operating vehicles in public way rashly endangering life." },
                              { sec: "Section 106 BNS", title: "Negligent Death (Hit & Run)", desc: "Causing accidental demise with hit-and-run sequence." }
                            ];
                          } else {
                            suggestions = [
                              { sec: "Section 324 BNS", title: "Mischief", desc: "Malicious property damage or utility dispute." }
                            ];
                          }

                          return suggestions.map((s, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col justify-between animate-fade-in">
                              <div>
                                <p className="font-bold text-[#1A3A6B]">{s.sec} - {s.title}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Legal Disclaimer */}
                      <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-[9px] text-amber-800 flex gap-2 font-medium">
                        <Info className="w-4.5 h-4.5 text-amber-700 shrink-0" />
                        <p>{language === 'en' ? 'Disclaimer: Recommended sections are system recommendations only. The final legal sections will be finalized by Police Officer upon FIR entry.' : 'अस्वीकरण: हे कायदेशीर कलमे केवळ संगणकीय शिफारस आहे. अंतिम कलमे पोलीस ठाण्यातील चौकशी अधिकारी ठरवतील.'}</p>
                      </div>
                    </div>

                    {/* Scrollable Document Preview */}
                    <div>
                      <label className="block text-[9.5px] font-black text-slate-400 uppercase mb-2">
                        {language === 'en' ? 'Formal Complaint Draft Preview' : 'तैयार शिकायत पत्र का पूर्वावलोकन'}
                      </label>
                      <div className="bg-slate-50 border-2 border-slate-200 p-5 rounded-2xl font-mono text-[10.5px] leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar select-text text-slate-800 shadow-inner text-left">
                        <div className="text-center font-bold text-[#1A3A6B] uppercase mb-4 pb-2 border-b border-slate-300">
                          {language === 'en' ? 'FORM I - COMPLAINT SUMMARIZATION DOCKET' : 'फॉर्म I - शिकायत सारांश (मार्गदर्शन मसौदा)'}
                        </div>
                        <p><strong>District/Precinct:</strong> Sakinaka Police Station, Zone 10, Mumbai City</p>
                        <p><strong>Incident Category:</strong> {wizardCategory}</p>
                        <p><strong>Occurrence Date & Time:</strong> {wizardForm.incidentDate?.replace('T', ' ')}</p>
                        <p><strong>Exact Occurrence Location:</strong> {wizardForm.incidentLocation}</p>
                        <p className="border-t border-dashed border-slate-300 my-2 pt-2"><strong>Complainant Full Name:</strong> {wizardForm.complainantName}</p>
                        <p><strong>Phone:</strong> {wizardForm.complainantPhone}</p>
                        <p><strong>Address:</strong> {wizardForm.complainantAddress}</p>
                        {wizardForm.stolenItems && <p><strong>Stolen Items:</strong> {wizardForm.stolenItems} (Approx Value: {wizardForm.estimatedValue})</p>}
                        <p className="border-t border-dashed border-slate-300 my-2 pt-2"><strong>Statement Description:</strong></p>
                        <p className="bg-white p-3 border border-slate-200 rounded italic text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {wizardForm.incidentDesc || 'No statement provided.'}
                        </p>
                        <p className="border-t border-dashed border-slate-300 my-2 pt-2"><strong>Accused / Suspect Profile:</strong> {wizardForm.accusedDesc || 'Unknown'}</p>
                        <p><strong>Witness Info:</strong> {wizardForm.witnessName || 'None'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    STEP 8: SUBMIT / DOWNLOAD PDF
                    ---------------------------------------------------- */}
              {wizardCategory !== null && wizardStep === 8 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 font-montserrat uppercase">
                    {language === 'en' ? 'Draft Generated Successfully!' : 'शिकायत पत्र सफलतापूर्वक तैयार!'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                    {language === 'en' 
                      ? 'Your formal complaint summarization draft is ready. You can secure it on your profile, copy the raw draft text, or print it as a certified PDF to submit directly at the police precinct.' 
                      : 'आपला मसुदा यशस्वीरीत्या तयार झाला आहे. तो आपण प्रोफाईलमध्ये जतन करू शकता किंवा पीडीएफ स्वरूपात डाऊनलोड करू शकता.'}
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-8 max-w-md mx-auto">
                    <button
                      onClick={() => {
                        const repId = "rep_" + Date.now();
                        const finalAnswers = {
                          complainantName: wizardForm.complainantName,
                          complainantPhone: wizardForm.complainantPhone,
                          complainantAddress: wizardForm.complainantAddress,
                          incidentDate: wizardForm.incidentDate,
                          incidentLocation: wizardForm.incidentLocation,
                          witnessName: wizardForm.witnessName || 'None',
                          witnessPhone: 'N/A',
                          incidentDesc: wizardForm.incidentDesc || 'Citizen statement',
                          stolenItem: wizardCategory === 'Mobile theft' || wizardCategory === 'Theft' ? (wizardForm.stolenItems || 'General movable item') : '',
                          itemValue: wizardCategory === 'Mobile theft' || wizardCategory === 'Theft' ? (wizardForm.estimatedValue || '0') : '',
                          hasCctv: 'Not sure',
                          suspectDesc: wizardForm.accusedDesc || 'Unknown',
                          transactionId: wizardForm.transactionId || '',
                          platformName: wizardForm.platformName || '',
                          hasScreenshots: 'Yes',
                          suspectContact: '',
                          injuriesSustained: wizardForm.abuseDetails || '',
                          hasMedicalReport: 'No',
                          weaponUsed: 'No',
                          relationshipAccused: '',
                          stalkerDetails: '',
                          frequency: '',
                          witnessDetails: '',
                          specialSupport: '',
                          abuserRelation: '',
                          abuseDuration: '',
                          medicalNeeded: '',
                          anyChildren: '',
                          otherDetails: ''
                        };
                        setAnswers(finalAnswers);
                        setClassifiedCategory(wizardCategory);

                        dbService.saveFIRReport(repId, {
                          userId: currentUser ? currentUser.uid : 'guest',
                          incidentType: wizardCategory,
                          incidentDate: wizardForm.incidentDate,
                          location: wizardForm.incidentLocation,
                          firDraft: finalAnswers
                        }).then(() => {
                          alert(language === 'en' ? 'Complaint secured in Profile drafts.' : 'विवरण सफलतापूर्वक सहेजा गया।');
                        });
                      }}
                      className="w-full sm:flex-1 py-3 px-4 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black rounded-xl shadow transition-all flex items-center justify-center gap-1.5 uppercase font-bold"
                    >
                      <Check className="w-4 h-4 text-white" />
                      {language === 'en' ? 'Secure to Profile' : 'मसौदा सहेजें'}
                    </button>

                    <button
                      onClick={() => {
                        const complainantName = wizardForm.complainantName;
                        const complainantPhone = wizardForm.complainantPhone;
                        const complainantAddress = wizardForm.complainantAddress;
                        const finalAnswers = {
                          complainantName,
                          complainantPhone,
                          complainantAddress,
                          incidentDate: wizardForm.incidentDate,
                          incidentLocation: wizardForm.incidentLocation,
                          witnessName: wizardForm.witnessName || 'None',
                          witnessPhone: 'N/A',
                          incidentDesc: wizardForm.incidentDesc || 'Citizen statement',
                          stolenItem: wizardCategory === 'Mobile theft' || wizardCategory === 'Theft' ? (wizardForm.stolenItems || 'General movable item') : '',
                          itemValue: wizardCategory === 'Mobile theft' || wizardCategory === 'Theft' ? (wizardForm.estimatedValue || '0') : '',
                          hasCctv: 'Not sure',
                          suspectDesc: wizardForm.accusedDesc || 'Unknown',
                          transactionId: wizardForm.transactionId || '',
                          platformName: wizardForm.platformName || '',
                          hasScreenshots: 'Yes',
                          suspectContact: '',
                          injuriesSustained: wizardForm.abuseDetails || '',
                          hasMedicalReport: 'No',
                          weaponUsed: 'No',
                          relationshipAccused: '',
                          stalkerDetails: '',
                          frequency: '',
                          witnessDetails: '',
                          specialSupport: '',
                          abuserRelation: '',
                          abuseDuration: '',
                          medicalNeeded: '',
                          anyChildren: '',
                          otherDetails: ''
                        };
                        setAnswers(finalAnswers);
                        setClassifiedCategory(wizardCategory);
                        
                        setTimeout(() => {
                          exportFIRDraftPDF();
                        }, 200);
                      }}
                      className="w-full sm:flex-1 py-3 px-4 bg-[#1A3A6B] hover:bg-[#12284C] text-white text-xs font-black rounded-xl shadow transition-all flex items-center justify-center gap-1.5 uppercase font-bold"
                    >
                      <Download className="w-4 h-4 text-white" />
                      {language === 'en' ? 'Download PDF' : 'पीडीएफ डाउनलोड'}
                    </button>
                  </div>
                </div>
              )}

              {/* ----------------------------------------------------
                    NAVIGATION BUTTONS FOOTER
                    ---------------------------------------------------- */}
              {wizardCategory !== null && (
                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (wizardStep > 2) {
                        setWizardStep(prev => prev - 1);
                      } else {
                        setWizardCategory(null);
                      }
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-350 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-all font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Previous' : 'पिछला'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (isPlayingSiren) triggerAudioSiren();
                        setCurrentScreen('dashboard');
                      }}
                      className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-xs font-bold transition-all font-sans"
                    >
                      {language === 'en' ? 'Exit Setup' : 'बाहर निकलें'}
                    </button>

                    {wizardStep < 8 ? (
                      <button
                        onClick={() => {
                          if (wizardStep === 2 && !wizardForm.incidentDesc?.trim()) {
                            alert(language === 'en' ? 'Please provide a simple incident description.' : 'कृपया घटना का संक्षिप्त विवरण अवश्य दर्ज करें।');
                            return;
                          }
                          if (wizardStep === 3 && !wizardForm.incidentLocation?.trim()) {
                            alert(language === 'en' ? 'Please specify occurrence location.' : 'कृपया घटना का स्थान निर्दिष्ट करें।');
                            return;
                          }
                          if (wizardStep === 4 && (!wizardForm.complainantName?.trim() || !wizardForm.complainantPhone?.trim())) {
                            alert(language === 'en' ? 'Please provide Complainant Name and Phone.' : 'कृपया शिकायतकर्ता का नाम और फोन नंबर दर्ज करें।');
                            return;
                          }
                          setWizardStep(prev => prev + 1);
                        }}
                        className="px-6 py-2.5 bg-[#1A3A6B] hover:bg-[#12284C] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition-all font-sans font-bold"
                      >
                        {language === 'en' ? 'Next Step' : 'अगला चरण'}
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentScreen('dashboard')}
                        className="px-6 py-2.5 bg-[#1A3A6B] hover:bg-[#12284C] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition-all font-sans font-bold"
                      >
                        {language === 'en' ? 'Finish Wizard' : 'तैयारी समाप्त करें'}
                        <Check className="w-3.5 h-3.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 10. EVIDENCE LOCKER FULL SCREEN */}
        {currentScreen === 'locker' && (
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">{text.lockerTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">{text.lockerSub}</p>
              </div>
              <span className="text-[9px] text-[#1A3A6B] font-bold px-3 py-1 rounded bg-[#E8EEF5] border border-[#1A3A6B]/20">
                AES-256 VAULT SECURITY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
                
                {/* Upload drag drop mock */}
                <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-[#1A3A6B]/30 hover:border-[#1A3A6B] text-center flex flex-col items-center justify-center min-h-[200px] transition-all shadow-sm">
                  {isUploading ? (
                    <div className="w-full flex flex-col items-center">
                      <div className="relative w-12 h-12 mb-3 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#1A3A6B] animate-spin"></div>
                        <span className="text-[9px] text-[#1A3A6B] font-bold font-mono">{uploadProgress}%</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700">Encrypting File...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[#1A3A6B]/40 mb-2 animate-bounce" />
                      <h4 className="text-xs font-bold text-slate-700">Select file to secure</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 mb-4 max-w-[150px]">Supports screenshots, PDFs, images or audio.</p>
                      
                      <label className="cyber-btn-blue px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow">
                        Choose File
                        <input 
                          type="file" 
                          onChange={handleEvidenceUpload}
                          className="hidden" 
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs shadow-sm">
                  <h4 className="font-bold text-[#1A3A6B] flex items-center gap-1.5 uppercase text-[9.5px] tracking-wider mb-2">
                    <Info className="w-3.5 h-3.5 text-[#1A3A6B]" />
                    Evidence Protection Checklist
                  </h4>
                  <ul className="flex flex-col gap-2 text-slate-500 leading-normal">
                    <li>&bull; <strong>Cyber Fraud:</strong> Preserve receipts, UPI transaction reference numbers, and scam URLs. Do not delete chats.</li>
                    <li>&bull; <strong>Theft/Burglary:</strong> Save portable CCTV footage backups. Keep purchase bills of items stolen.</li>
                    <li>&bull; <strong>Harassment:</strong> Capture time-stamped call logs, WhatsApp profiles, or video records.</li>
                  </ul>
                </div>

              </div>

              <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">
                  {text.lockerTimeline}
                </h3>

                <div className="flex flex-col gap-3">
                  {evidenceFiles.map(file => (
                    <div key={file.id} className="relative timeline-item flex gap-4 text-xs pl-8">
                      <div className="absolute left-3 top-2.5 w-3 h-3 rounded-full bg-[#1A3A6B] border border-white shadow"></div>
                      
                      <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#1A3A6B]/20 transition-all flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded bg-[#E8EEF5] text-[#1A3A6B] flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">Size: {file.size} &bull; Category: <span className="text-[#1A3A6B] font-bold">{file.category}</span></p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[8px] text-slate-400 font-mono block">{file.time}</span>
                          <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">ENCRYPTED</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="cyber-btn-blue px-6 py-2.5 rounded-xl text-xs font-bold shadow"
              >
                Return to Portal Home
              </button>
            </div>

          </div>
        )}

        {/* 11. POLICE STATION LOCATOR SCREEN */}
        {currentScreen === 'locator' && (
          <div className="max-w-5xl mx-auto">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">{text.locatorTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">{text.locatorSub}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-[#1A3A6B] font-bold px-3 py-1.5 rounded bg-[#E8EEF5] border border-[#1A3A6B]/20">
                  ZONE 10 JURISDICTION
                </span>
                {!isLiveTracking ? (
                  <button onClick={startLiveTracking} className="px-4 py-1.5 bg-[#1A3A6B] hover:bg-[#12284C] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors">
                    <Icon name="mapPin" className="w-3.5 h-3.5" /> Start Live Location Tracking
                  </button>
                ) : (
                  <button onClick={stopLiveTracking} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-colors animate-pulse">
                    <Icon name="x" className="w-3.5 h-3.5" /> Stop Live Location Tracking
                  </button>
                )}
              </div>
            </div>

            {/* Live Tracking Status Dashboard */}
            {isLiveTracking && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                      <Icon name="mapPin" className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Live Tracking Active</h4>
                      <p className="text-[10px] text-blue-700 mt-0.5">
                        {liveCoords ? `Lat: ${liveCoords.lat.toFixed(5)}, Lng: ${liveCoords.lng.toFixed(5)}` : 'Locating satellite...'}
                      </p>
                      <p className="text-[10px] text-blue-700 mt-0.5 font-bold" id="accuracyText">
                        {liveCoords ? `Accuracy: ${Math.round(accuracyMeters)} meters` : ''}
                      </p>
                    </div>
                  </div>
                  
                  {liveCoords && (
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-blue-900">Nearest Station: {sortedStations[0]?.name}</p>
                        <p className="text-[9px] text-blue-600 mt-0.5">Last updated: {lastUpdatedTime}</p>
                      </div>
                      <button onClick={refreshLocation} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded shadow transition-colors flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-10.05l5.67-5.67"/></svg> Refresh Location
                      </button>
                    </div>
                  )}
                </div>
                {accuracyWarning && (
                  <div className="mt-3 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold p-2 rounded flex items-center gap-2">
                    <Icon name="alertTriangle" className="w-4 h-4" /> {accuracyWarning}
                  </div>
                )}
              </div>
            )}
            
            {trackingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-xl mb-6 flex items-center gap-2">
                <Icon name="alertTriangle" className="w-4 h-4" /> {trackingError}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Map Canvas */}
              <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative min-h-[350px]">
                <div
                  ref={mapContainerRef}
                  title="Precinct Full Map"
                  style={{ height: '300px', width: '100%', borderRadius: '12px' }}
                  className="w-full h-full bg-slate-100 flex items-center justify-center"
                >
                  <p className="text-xs text-slate-500 font-bold">Loading Google Maps...</p>
                </div>
              </div>

              {/* Station Listing */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                  Precinct Listing (Sakinaka HQ Division)
                </h3>

                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {isSearchingPlaces && (
                    <div className="p-4 text-center text-xs text-slate-500 font-bold bg-slate-50 rounded-xl animate-pulse">
                      Scanning area for active police stations...
                    </div>
                  )}
                  {!isSearchingPlaces && sortedStations.map((ps) => (
                    <div 
                      key={ps.id} 
                      className={`p-4 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-4 transition-all hover:border-[#1A3A6B]/30 ${
                        (classifiedCategory === "Cybercrime / Fraud" && ps.type === 'Cyber Cell') ||
                        ((classifiedCategory === "Harassment / Stalking" || classifiedCategory === "Domestic Violence") && ps.type === 'Women Station')
                          ? 'border-[#1A3A6B] bg-[#E8EEF5]' 
                          : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-800 leading-tight truncate">{ps.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                            ps.type === 'Cyber Cell' ? 'bg-blue-100 text-blue-800' :
                            ps.type === 'Women Station' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {ps.type === 'Cyber Cell' ? text.cyberCell : ps.type === 'Women Station' ? text.womenCell : 'Precinct'}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal font-mono">{ps.address}</p>
                        <p className="text-[9px] text-[#1A3A6B] mt-1 font-mono">Distance: {ps.distance} &bull; Hotline: {ps.contact}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => alert(`Calling ${ps.name} dispatch hotline: ${ps.contact}`)}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#1A3A6B] hover:bg-slate-100"
                          title="Call Precinct"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <a 
                          href={isLiveTracking && liveCoords ? `https://www.google.com/maps/dir/?api=1&origin=${liveCoords.lat},${liveCoords.lng}&destination=${ps.lat},${ps.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${ps.lat},${ps.lng}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-[#1A3A6B] hover:bg-slate-100"
                          title={trans.getDirections}
                        >
                          <Map className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            <div className="mt-8 text-center">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="cyber-btn-blue px-6 py-2.5 rounded-xl text-xs font-bold shadow"
              >
                Return to Portal Home
              </button>
            </div>

          </div>
        )}

        {/* 12. SOS PANIC EMERGENCY SCREEN */}
        {currentScreen === 'sos' && (
          <div className="max-w-3xl mx-auto animate-siren rounded-3xl p-6 md:p-10 border-4 border-red-600 relative overflow-hidden shadow-2xl">
            
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                <span className="text-[9px] text-red-700 font-mono font-black uppercase">LIVE SOS DISPATCH ACTIVE</span>
              </div>
              <span className="text-[8px] text-red-600 font-mono">SECURE CHANNEL SEC-SOS-1</span>
            </div>

            <div className="text-center pt-8 pb-4">
              <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-600 animate-pulse-red flex items-center justify-center mx-auto mb-6 shadow-md">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-black text-red-700 mb-1 uppercase tracking-wider">
                {text.emergencyHeader}
              </h2>
              <p className="text-xs text-red-800 font-bold max-w-lg mx-auto leading-relaxed mb-6">
                {text.emergencySub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 relative z-10">
              
              {/* Safety directives */}
              <div className="col-span-12 md:col-span-7 bg-white p-5 rounded-2xl border border-red-300 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-red-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-red-600 shrink-0" />
                    IMMEDIATE SAFETY DIRECTIVES
                  </h4>
                  
                  <ul className="flex flex-col gap-2.5 text-xs text-slate-700 font-bold">
                    <li className="p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                      {text.reachSafety}
                    </li>
                    <li className="p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                      STEP 2: Share Live GPS Coordinates with dispatch numbers.
                    </li>
                    <li className="p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                      STEP 3: Toggle the local alarm sound below to attract help.
                    </li>
                  </ul>
                </div>

                {/* Sire alarm buttons */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[9px] text-slate-500 font-bold leading-normal">{text.sirenSimulation}</span>
                  <button 
                    onClick={triggerAudioSiren}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all shadow ${
                      isPlayingSiren 
                        ? 'bg-red-600 text-white animate-pulse' 
                        : 'bg-slate-150 border border-slate-350 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isPlayingSiren ? text.sirenPlaying : text.sirenToggle}
                  </button>
                </div>

              </div>

              {/* Speed dials */}
              <div className="col-span-12 md:col-span-5 flex flex-col gap-3">
                <h4 className="text-[9px] text-red-700 font-mono tracking-wider uppercase border-b border-red-200 pb-2 font-bold">
                  DIRECT ASSISTANCE NUMBERS
                </h4>

                <button 
                  onClick={() => alert("Calling Emergency Police Control Room: 100")}
                  className="w-full p-4 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4.5 h-4.5 animate-bounce" />
                    {text.call100}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>

                <button 
                  onClick={() => alert("Calling All-In-One National Emergency Response: 112")}
                  className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-red-300 text-red-700 font-bold text-xs flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Phone className="w-4.5 h-4.5" />
                    {text.call112}
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-700" />
                </button>

                <button 
                  onClick={() => alert("Calling Women Safety Helpline: 1091")}
                  className="w-full p-4 rounded-2xl bg-white hover:bg-slate-50 border border-red-300 text-red-700 font-bold text-xs flex items-center justify-between shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <HeartHandshake className="w-4.5 h-4.5" />
                    {text.call1091}
                  </span>
                  <ChevronRight className="w-4 h-4 text-red-700" />
                </button>

                {/* Coordinates */}
                <div className="p-3.5 rounded-2xl bg-white border border-red-200 text-[9.5px] text-slate-700 font-mono shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#1A3A6B]">GPS LOCK STATUS</span>
                    <span className="text-red-600 font-black animate-pulse">TRANSMITTING</span>
                  </div>
                  <p className="mt-1">{text.coordinates} <strong>{gpsCoords.lat.toFixed(6)}° N, {gpsCoords.lng.toFixed(6)}° E</strong></p>
                  <p className="mt-1 text-[8.5px] text-slate-400 leading-normal italic">{text.dispatching}</p>
                </div>

              </div>

            </div>

            <div className="text-center relative z-10 pt-2">
              <button 
                onClick={() => {
                  if (isPlayingSiren) triggerAudioSiren();
                  setCurrentScreen('dashboard');
                }}
                className="px-6 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-800 text-xs font-bold shadow-sm"
              >
                {text.cancelEmergency}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ----------------------------------------------------
          OFFICIAL FOOTER
          ---------------------------------------------------- */}
      <footer className="mt-20 text-center text-xs text-slate-400 font-mono max-w-xl mx-auto leading-relaxed border-t border-slate-200 pt-6">
        <p>&copy; 2026 Smart FIR Portal &bull; Government-Service Legal Tech Initiative.</p>
        <p className="mt-1 text-[9.5px] text-slate-400">All complaint drafts comply strictly with the Bharatiya Nyaya Sanhita (BNS), 2023 & IPC, 1860.</p>
      </footer>

    </div>
  );
}

export default App;
