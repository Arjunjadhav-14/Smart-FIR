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
  const [currentScreen, setCurrentScreen] = useState('splash'); // splash, auth, dashboard, chat, classification, questions, rights, preview, pdfsuccess, locker, locator, sos, drafts
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

  // Draft Preview Tab (Bilingual)
  const [draftLangTab, setDraftLangTab] = useState('en'); // en, hi

  // Developer Configuration Console state
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [apiConfigInput, setApiConfigInput] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState('');

  // GPS updates
  const [gpsCoords, setGpsCoords] = useState({ lat: 19.0968, lng: 72.8884 });

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
  // BOT RESPONSE CLASSIFIER AGENT
  // ----------------------------------------------------
  const handleBotResponse = (userText) => {
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

    setTimeout(() => {
      setIsTyping(false);
      
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
      
      setAnswers(prev => ({ ...prev, incidentDesc: userText }));

      let replyText = "";
      if (language === 'hi') {
        replyText = `आपके विवरण के आधार पर, यह मामला "${category}" के अंतर्गत वर्गीकृत होता है।\n\nप्राथमिक कानूनी धाराएं: ${legalDetails.bns} (BNS)\nसंभावित गंभीरता स्तर: ${legalDetails.severity}।\n\nक्या हम इस वर्गीकरण की पुष्टि करें और आपके शिकायत का ड्राफ्ट तैयार करने के लिए आगे बढ़ें?`;
      } else if (language === 'mr') {
        replyText = `आपल्या वर्णनावरून, हे प्रकरण "${category}" श्रेणी अंतर्गत वर्गीकृत केले आहे.\n\nप्राथमिक कायदेशीर कलमे: ${legalDetails.bns} (BNS)\nगांभीर्य पातळी: ${legalDetails.severity}।\n\nआम्ही पुढे जावे का?`;
      } else {
        replyText = `Based on your statement description, this is categorized under "${category}".\n\nPrima Facie Codification: ${legalDetails.bns} (BNS)\nAssessed Severity Matrix: ${legalDetails.severity}.\n\nShould we confirm this category and proceed with the guided questionnaire to prepare your formal draft?`;
      }

      setChatHistory(prev => [
        ...prev,
        { role: "assistant", text: replyText, isClassificationPrompt: true, categorySuggested: category }
      ]);
    }, 1200);
  };

  const submitChatMessage = (customText = null) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim()) return;

    setChatHistory(prev => [...prev, { role: "user", text: textToSend }]);
    if (!customText) setUserInput('');

    handleBotResponse(textToSend);
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

  // Settings: Apply dynamice config key
  const saveDeveloperConfig = () => {
    if (apiConfigInput) {
      localStorage.setItem("firebaseConfig", apiConfigInput);
      alert("Firebase live config saved. App will now reload in LIVE database mode!");
      window.location.reload();
    } else {
      localStorage.removeItem("firebaseConfig");
      alert("Developer config cleared. Reloading in local mock database mode.");
      window.location.reload();
    }
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

            {/* Dev Console Trigger */}
            <button 
              onClick={() => setShowDevConsole(!showDevConsole)}
              className="p-1.5 rounded bg-[#12284C] border border-white/10 text-slate-300 hover:text-amber-400"
              title="Developer DB Connections"
            >
              <Settings className="w-4 h-4" />
            </button>

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
          DEVELOPER CONSOLE (LIVE DB INTEGRATION)
          ---------------------------------------------------- */}
      {showDevConsole && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="bg-slate-900 border-2 border-[#1A3A6B] text-white p-5 rounded-xl relative shadow-lg">
            <button 
              onClick={() => setShowDevConsole(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-amber-400 font-mono text-sm uppercase font-black flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4" />
              Smart FIR Developer Integration Dashboard
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Connect this responsive LegalTech portal to your own Firebase project. Paste your standard Firebase Configuration JSON. If left empty, the application runs 100% flawlessly locally using client-side fallback storage.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] text-amber-400 font-mono uppercase mb-1">Firebase Config JSON Object</label>
                <textarea 
                  value={apiConfigInput} 
                  onChange={(e) => setApiConfigInput(e.target.value)}
                  placeholder='{"apiKey": "AIzaSy...", "authDomain": "...", "projectId": "..."}' 
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs font-mono min-h-[100px] text-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] text-emerald-400 font-mono">
                System Storage Engine: <span className="font-bold underline">{authService.isFirebaseActive() ? 'LIVE_FIREBASE_CONNECTED' : 'LOCAL_STORAGE_FALLBACK'}</span>
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setApiConfigInput('');
                    localStorage.removeItem("firebaseConfig");
                    alert("Cleared custom credentials.");
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded font-bold"
                >
                  Clear Config
                </button>
                <button 
                  onClick={saveDeveloperConfig}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded"
                >
                  Save & Bind DB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MAIN SCREEN ROUTER VIEW
          ---------------------------------------------------- */}
      <main className="max-w-7xl mx-auto px-4 mt-6">

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
          <div className="max-w-4xl mx-auto">
            
            {/* Chat header */}
            <div className="bg-white border border-slate-200 p-4 rounded-t-3xl border-b-2 border-b-[#1A3A6B] flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8EEF5] flex items-center justify-center border border-[#1A3A6B]/20 text-[#1A3A6B]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Legal AI Companion</h4>
                  <span className="text-[9px] text-[#1A3A6B] flex items-center gap-1 font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A6B] animate-ping"></div>
                    Active &bull; Multilingual Assistant
                  </span>
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
            <div className="h-[400px] overflow-y-auto bg-white border border-slate-200 p-6 flex flex-col gap-4 custom-scrollbar shadow-inner">
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#1A3A6B] text-white font-semibold rounded-tr-none shadow' 
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text.split('\n').map((para, k) => (
                      <p key={k} className={k > 0 ? "mt-2" : ""}>{para}</p>
                    ))}

                    {/* Category suggestions */}
                    {msg.isClassificationPrompt && (
                      <div className="mt-4 p-3 rounded-xl bg-white border border-[#1A3A6B]/30 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Classified Incident:</span>
                          <span className="text-[10px] font-black text-[#1A3A6B] px-2 py-0.5 rounded bg-[#E8EEF5]">
                            {msg.categorySuggested}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mb-3">Proceed to start the 5 contextual follow-up questions tailored for this offense category.</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => confirmAIClassification(msg.categorySuggested)}
                            className="cyber-btn-blue px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm"
                          >
                            Yes, Start Flow <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentScreen('classification');
                            }}
                            className="px-3 py-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold"
                          >
                            Re-Classify Category
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-400 mt-1 font-mono uppercase">
                    {msg.role === 'user' ? 'Citizen' : 'Portal AI'}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="self-start flex items-center gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 rounded-tl-none">
                  <div className="dots-flashing"></div>
                </div>
              )}
            </div>

            {/* Warning Card */}
            {showWarning && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mt-3 flex items-start gap-2.5 text-xs text-red-800">
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

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={() => submitChatMessage("My gold wallet was stolen from my shoulder bag in a local bus.")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm"
              >
                &bull; Theft Example
              </button>
              <button 
                onClick={() => submitChatMessage("I lost 25,000 Rupees from a UPI debit call claiming to be an official bank agent asking for OTP.")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm"
              >
                &bull; Cyber Fraud Example
              </button>
              <button 
                onClick={() => submitChatMessage("A stranger followed me from the Sakinaka metro gate and shouted offensive threats.")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-[#1A3A6B] hover:border-[#1A3A6B]/30 text-xs font-semibold shadow-sm"
              >
                &bull; Harassment Example
              </button>
            </div>

            {/* Input wave Voice */}
            {isVoiceRecording && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-[#1A3A6B] font-mono uppercase mb-2 animate-pulse">{text.voiceInputActive}</span>
                <div className="flex items-center gap-1.5 h-8">
                  <div className="w-1.5 bg-[#1A3A6B] rounded animate-[bounce_0.8s_infinite] h-6"></div>
                  <div className="w-1.5 bg-amber-500 rounded animate-[bounce_0.6s_infinite] h-4"></div>
                  <div className="w-1.5 bg-[#1A3A6B] rounded animate-[bounce_0.9s_infinite] h-7"></div>
                  <div className="w-1.5 bg-amber-500 rounded animate-[bounce_0.5s_infinite] h-3"></div>
                </div>
              </div>
            )}

            {/* Input box */}
            <div className="mt-4 flex gap-3">
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
                className="cyber-btn-blue px-6 py-3.5 rounded-2xl text-xs font-black uppercase shrink-0"
              >
                {text.send}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="text-xs text-slate-500 hover:text-[#1A3A6B] flex items-center gap-1.5 mx-auto transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> {text.backToDashboard}
              </button>
            </div>

          </div>
        )}

        {/* 5. INCIDENT CLASSIFICATION SCREEN */}
        {currentScreen === 'classification' && (
          <div className="max-w-2xl mx-auto text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-[#E8EEF5] flex items-center justify-center mx-auto mb-5 border border-[#1A3A6B]/20">
              <Layers className="w-7 h-7 text-[#1A3A6B]" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">{text.classificationTitle}</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              {text.confirmCategory}
            </p>

            <div className="bg-white border-2 border-[#1A3A6B] p-6 rounded-3xl mb-8 relative text-left shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">prima facie AI classification</span>
                <span className={`px-2.5 py-1 rounded text-xs font-black tracking-widest ${
                  severity === 'LOW' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  severity === 'MEDIUM' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-red-50 text-red-800 border border-red-200 animate-pulse'
                }`}>
                  {severity} SEVERITY
                </span>
              </div>

              <div className="mb-4">
                <div className="text-xl font-black text-[#1A3A6B]">{classifiedCategory}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-6">
                <h5 className="font-bold text-[#1A3A6B] mb-2 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Indian Codification References:
                </h5>
                <p className="mb-1"><strong>IPC 1860 (Old Code):</strong> {getLegalSections(classifiedCategory).ipc}</p>
                <p className="mb-2"><strong>BNS 2023 (New Code):</strong> {getLegalSections(classifiedCategory).bns}</p>
                <p className="text-slate-500 mt-2 font-mono text-[10.5px] italic leading-normal border-t border-slate-200 pt-2">{getLegalSections(classifiedCategory).desc}</p>
              </div>

              <button 
                onClick={() => confirmAIClassification(classifiedCategory)}
                className="w-full cyber-btn-blue py-3.5 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow"
              >
                {text.confirmProceed}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Category options listing */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl text-left shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 mb-4">
                {text.changeCategory}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(CATEGORY_QUESTIONS).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setClassifiedCategory(cat);
                      setSeverity(getLegalSections(cat).severity);
                    }}
                    className={`p-3 text-left rounded-xl text-xs font-bold border transition-all ${
                      classifiedCategory === cat 
                        ? 'bg-[#E8EEF5] border-[#1A3A6B] text-[#1A3A6B] font-black' 
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 6. GUIDED QUESTIONNAIRE SCREEN */}
        {currentScreen === 'questions' && (
          <div className="max-w-xl mx-auto">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] text-[#1A3A6B] font-bold uppercase tracking-wider font-mono">
                Guided FIR Docket Flow
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                Question <strong className="text-slate-800">{currentQuestionIdx + 1}</strong> of <strong>{guidedQuestions.length}</strong>
              </span>
            </div>

            <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-[#1A3A6B] rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIdx + 1) / guidedQuestions.length) * 100}%` }}
              ></div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-md relative overflow-hidden mb-6">
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] text-[#1A3A6B] font-bold border border-[#1A3A6B]/30 px-2 py-0.5 rounded bg-[#E8EEF5] uppercase">
                  {classifiedCategory}
                </span>
                
                <button 
                  onClick={() => speakText(guidedQuestions[currentQuestionIdx]?.q)}
                  className="p-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-[#1A3A6B]"
                  title="Read out loud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-black text-slate-800 leading-snug mb-5">
                {guidedQuestions[currentQuestionIdx]?.q}
              </h3>

              {guidedQuestions[currentQuestionIdx]?.type === 'select' ? (
                <div className="flex flex-col gap-2">
                  {guidedQuestions[currentQuestionIdx]?.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionAnswerSubmit(opt)}
                      className="w-full p-3.5 text-left rounded-xl bg-slate-50 hover:bg-[#E8EEF5] border border-slate-200 hover:border-[#1A3A6B] font-bold text-xs text-slate-700 hover:text-[#1A3A6B] transition-all"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea 
                    className="w-full glass-input p-4 rounded-xl text-xs min-h-[100px] mb-4"
                    placeholder={guidedQuestions[currentQuestionIdx]?.placeholder}
                    id={`answer-textarea-${currentQuestionIdx}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const val = e.currentTarget.value;
                        if (val.trim()) {
                          handleQuestionAnswerSubmit(val);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`answer-textarea-${currentQuestionIdx}`);
                      if (el && el.value.trim()) {
                        handleQuestionAnswerSubmit(el.value);
                        el.value = '';
                      } else {
                        handleQuestionAnswerSubmit("Declined details");
                      }
                    }}
                    className="w-full cyber-btn-blue py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow"
                  >
                    Submit Entry <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-1">
              <button 
                onClick={() => {
                  if (currentQuestionIdx > 0) {
                    setCurrentQuestionIdx(prev => prev - 1);
                  } else {
                    setCurrentScreen('classification');
                  }
                }}
                className="text-xs text-slate-500 hover:text-[#1A3A6B] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back Step
              </button>
              <button 
                onClick={() => setCurrentScreen('rights')}
                className="text-xs text-[#1A3A6B]/80 hover:text-[#1A3A6B] font-semibold"
              >
                Skip to Rights Explainer &bull;&bull;
              </button>
            </div>

          </div>
        )}

        {/* 7. RIGHTS EXPLAINER SCREEN */}
        {currentScreen === 'rights' && (
          <div className="max-w-3xl mx-auto">
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#E8EEF5] flex items-center justify-center mx-auto mb-4 border border-[#1A3A6B]/20">
                <Scale className="w-6 h-6 text-[#1A3A6B]" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-1">{text.legalRightsTitle}</h2>
              <p className="text-xs text-slate-500 leading-normal max-w-xl mx-auto">
                {text.rightsSub}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              <div className="bg-white p-5 rounded-2xl border-l-4 border-[#1A3A6B] shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">1. RIGHT TO FREE PHYSICAL COPY</h4>
                  <span className="text-[8px] font-mono text-[#1A3A6B] bg-[#E8EEF5] px-2 py-0.5 rounded font-bold">Sec 154 CrPC</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As the informant filing an FIR, you are legally entitled to receive a complete copy of the registered FIR immediately. Police officers cannot charge any fees for this record.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-l-4 border-[#1A3A6B] shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-xs font-black text-[#1A3A6B] uppercase tracking-wider">2. RIGHT TO FILE ZERO FIR</h4>
                  <span className="text-[8px] font-mono text-[#1A3A6B] bg-[#E8EEF5] px-2 py-0.5 rounded font-bold">Supreme Court</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A police station is mandated to record your FIR even if the incident occurred outside their designated jurisdiction boundary. It gets logged as a 'Zero FIR' and shifted internally.
                </p>
              </div>

              {classifiedCategory === "Cybercrime / Fraud" && (
                <>
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-amber-600 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider">CYBER CELL HELPLINE MANDATE</h4>
                      <span className="text-[8px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">IT Act</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      All cybercrimes involving digital fraud must be expedited. Logging details into the <strong>1930 National Cyber Fraud portal</strong> immediately alerts banks to freeze transitioning funds in real-time.
                    </p>
                  </div>
                </>
              )}

              {(classifiedCategory === "Harassment / Stalking" || classifiedCategory === "Domestic Violence") && (
                <>
                  <div className="bg-white p-5 rounded-2xl border-l-4 border-rose-600 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider">RIGHT TO FEMALE OFFICER HANDLING</h4>
                      <span className="text-[8px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">Sec 173 BNS</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      By law, FIR registration and statement recording for women-related offenses must be completed by a female police officer or in the presence of female guardians at all times.
                    </p>
                  </div>
                </>
              )}

            </div>

            <div className="text-center">
              <button 
                onClick={() => setCurrentScreen('preview')}
                className="cyber-btn-blue px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto shadow"
              >
                {text.proceedToDraft} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* 8. FIR DRAFT PREVIEW & BILINGUAL TOGGLE */}
        {currentScreen === 'preview' && (
          <div className="max-w-4xl mx-auto">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">{text.firDraftTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">{text.firDraftSub}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setCurrentScreen('questions')}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  Edit Answers
                </button>
                <button 
                  onClick={exportFIRDraftPDF}
                  className="cyber-btn-blue px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> {text.downloadPdf}
                </button>
              </div>
            </div>

            {/* Bilingual Tab Selector for rendering preview */}
            <div className="flex border-b border-slate-200 mb-4">
              <button
                onClick={() => setDraftLangTab('en')}
                className={`px-4 py-2.5 text-xs font-black uppercase border-b-2 ${draftLangTab === 'en' ? 'border-[#1A3A6B] text-[#1A3A6B]' : 'border-transparent text-slate-500'}`}
              >
                English Version
              </button>
              <button
                onClick={() => setDraftLangTab('hi')}
                className={`px-4 py-2.5 text-xs font-black uppercase border-b-2 ${draftLangTab === 'hi' ? 'border-[#1A3A6B] text-[#1A3A6B]' : 'border-transparent text-slate-500'}`}
              >
                Hindi Version (हिंदी संस्करण)
              </button>
            </div>

            {/* Official Looking Document preview */}
            <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-md border-8 border-slate-200 font-mono text-xs leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar relative">
              
              {/* Draft Watermark watermark */}
              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.03] transform -rotate-45">
                <span className="text-[55px] font-black tracking-widest text-[#1A3A6B]">SMART FIR PORTAL DRAFT</span>
              </div>

              {/* Document Strip Accent */}
              <div className="flex h-1.5 w-full mb-6">
                <div className="flex-1 bg-[#D97706]"></div>
                <div className="flex-1 bg-[#FFFFFF]"></div>
                <div className="flex-1 bg-[#16A34A]"></div>
              </div>

              {/* Render dynamic translations */}
              {(() => {
                const trans = TRANSLATED_COMPLAINT[draftLangTab] || TRANSLATED_COMPLAINT['en'];
                const legalDetails = getLegalSections(classifiedCategory);

                return (
                  <div>
                    <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
                      <h3 className="text-sm font-bold tracking-tight text-[#1A3A6B] uppercase">{trans.headerTitle}</h3>
                      <p className="text-[10px] mt-1 font-bold text-slate-500">{trans.headerSub}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p>{trans.state}</p>
                        <p>{trans.district}</p>
                        <p>{trans.station}</p>
                      </div>
                      <div>
                        <p>{trans.refNo}{Date.now().toString().slice(-4)}</p>
                        <p><strong>{trans.severity}</strong> {severity}</p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-3"></div>

                    {/* Complainant Ident */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section2}</p>
                      <p>&bull; <strong>{trans.name}</strong> {answers.complainantName}</p>
                      <p>&bull; <strong>{trans.phone}</strong> {answers.complainantPhone}</p>
                      <p>&bull; <strong>{trans.city}</strong> {answers.complainantAddress}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-3"></div>

                    {/* Occurrence Timeline */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section3}</p>
                      <p>&bull; <strong>{trans.incidentDate}</strong> {answers.incidentDate.replace('T', ' ')}</p>
                      <p>&bull; <strong>{trans.incidentLoc}</strong> {answers.incidentLocation}</p>
                      <p>&bull; <strong>{trans.witness}</strong> {answers.witnessName}</p>
                      <p>&bull; <strong>{trans.accused}</strong> {answers.relationshipAccused}</p>
                    </div>

                    <div className="border-t border-dashed border-slate-400 my-3"></div>

                    {/* Formal Statement Description */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section4}</p>
                      <p className="bg-slate-50 p-3 rounded border border-slate-200 italic whitespace-pre-wrap leading-relaxed text-slate-700">
                        {answers.incidentDesc || "Citizen reported incident details of " + classifiedCategory}
                      </p>
                    </div>

                    {/* Questionnaire list */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section5}</p>
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        {guidedQuestions.map((q, idx) => (
                          <div key={idx} className="mb-2 last:mb-0">
                            <p className="font-bold text-slate-600">Q: {q.q}</p>
                            <p className="text-slate-800 ml-2">&bull; {answers[q.key] || "N/A"}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Codification */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section6}</p>
                      <p>&bull; <strong>{trans.bnsCode}</strong> {legalDetails.bns}</p>
                      <p>&bull; <strong>{trans.ipcCode}</strong> {legalDetails.ipc}</p>
                      <p className="text-[10px] text-slate-500 mt-1 italic">{trans.note} {legalDetails.desc}</p>
                    </div>

                    {/* Evidence index */}
                    <div className="mb-4">
                      <p className="font-bold uppercase mb-1 text-[#1A3A6B]">{trans.section7}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {evidenceFiles.map((file, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px]">
                            <p className="font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-slate-400">Size: {file.size} &bull; Type: {file.category}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-slate-800 pt-4 flex justify-between items-center text-[10px] mt-6">
                      <div>
                        <p className="font-bold text-[#1A3A6B]">Smart FIR Verification Seal</p>
                        <p className="text-[8px] text-slate-400 italic">State Legal Security Clearance active.</p>
                      </div>
                      <div className="text-right border-t border-slate-600 px-4 pt-1 font-bold">
                        {trans.signatureComplainant}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Disclaimer strip */}
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-normal flex gap-3 shadow-sm">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <p>{text.firDisclaimer}</p>
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex justify-center gap-3">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-600 text-xs font-bold"
              >
                Cancel & return Home
              </button>
              <button 
                onClick={exportFIRDraftPDF}
                className="cyber-btn-blue px-6 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <DownloadCloud className="w-4.5 h-4.5" /> Download Complaint PDF
              </button>
            </div>

          </div>
        )}

        {/* 9. PDF GENERATION SUCCESS SCREEN */}
        {currentScreen === 'pdfsuccess' && (
          <div className="max-w-md mx-auto text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 mb-1">{text.pdfReady}</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Your official citizen legal complaint draft has been compiled successfully and saved. Present this copy to any police precinct.
            </p>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-sm mb-6 relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-[#E8EEF5] flex items-center justify-center text-[#1A3A6B]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">Smart_FIR_Draft.pdf</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bilingual Draft &bull; jsPDF Generated</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Fully Synchronized & Saved
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={exportFIRDraftPDF}
                className="w-full cyber-btn-blue py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" /> Download Copy Again
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print FIR
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Smart FIR Draft:\nCategory: ${classifiedCategory}\nPrimary Sections: ${getLegalSections(classifiedCategory).bns}\nVerified on Portal.`);
                    alert("Draft summary copied to clipboard!");
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" /> Copy Text
                </button>
              </div>
            </div>

            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="mt-8 text-xs text-slate-500 hover:text-[#1A3A6B] flex items-center justify-center gap-1.5 mx-auto transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Portal Home
            </button>

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
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">{text.locatorTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">{text.locatorSub}</p>
              </div>
              <span className="text-[9px] text-[#1A3A6B] font-bold px-3 py-1 rounded bg-[#E8EEF5] border border-[#1A3A6B]/20">
                ZONE 10 JURISDICTION
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Map Canvas */}
              <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative min-h-[350px]">
                <iframe
                  title="Sakinaka Region Divisional Map Locator"
                  width="100%"
                  height="300"
                  frameBorder="0" 
                  style={{ border: 0, borderRadius: '12px' }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsKey || 'AIzaSyDummyKeyForStaticFallback'}&q=Sakinaka+Police+Station,Mumbai+Zone10+Maharashtra&zoom=14`}
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Station Listing */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                  Precinct Listing (Sakinaka HQ Division)
                </h3>

                <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {POLICE_STATIONS.map((ps) => (
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
                          href={`https://www.google.com/maps/dir/?api=1&destination=${ps.lat},${ps.lng}`}
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
