# CONVEX AI

### Intelligent Conveyor Belt Health Monitoring & Predictive Maintenance

CONVEX AI is an intelligent monitoring platform designed for conveyor belt systems in the iron ore mining industry.

The system is designed to combine multi-parameter sensing, edge processing, long-range communication, digital visualization, condition monitoring and predictive analytics to identify abnormal conveyor conditions before they escalate into major belt damage or joint rupture.

> **Smart India Hackathon 2026 — SIH26008**  
> **Ministry of Steel | Hardware | Smart Automation**
>
> **Link: https://convexai-pi.vercel.app/**

---

## 🚨 Problem

Conveyor belts are critical to continuous material handling in mining operations. They operate under demanding conditions involving:

- Heavy loads
- Continuous operation
- Mechanical vibration
- Belt tension variations
- Temperature changes
- Abrasion and component degradation

Progressive deterioration can eventually lead to:

**Abnormal Condition → Belt Damage → Joint Failure → Material Spillage → Downtime → Safety Risk**

Conventional periodic inspection and isolated threshold alarms can make it difficult to continuously understand the health and degradation of the conveyor system.

---

## 💡 Proposed Solution

CONVEX AI proposes a distributed, multi-parameter monitoring system for conveyor belt health.

The proposed hardware architecture uses sensor nodes to monitor:

- Vibration
- Strain / belt tension
- Temperature
- Speed / RPM

The sensor data is intended to be processed at the edge and transmitted using long-range, low-power communication before being visualized and analyzed centrally.

### Core workflow


SENSE
  ↓
PROCESS
  ↓
TRANSMIT
  ↓
MONITOR
  ↓
ANALYZE
  ↓
ALERT
  ↓
MAINTAIN

The long-term objective is to enable condition-based and predictive maintenance instead of relying primarily on reactive maintenance.

🖥️ Current Digital Prototype

The current repository contains the digital engineering prototype of the proposed CONVEX AI system.

Instead of claiming a physically deployed sensor network, the current implementation provides a digital environment for demonstrating and testing the system concept.

Current capabilities
Interactive CONVEX AI monitoring interface
3D conveyor visualization
Digital conveyor representation
Simulated live telemetry
Sensor-condition visualization
Conveyor health monitoring
Scenario-based fault simulation
ML/analytics interface
Simulation controls
Telemetry replay
Splice monitoring
Emergency interlock interface
OT security monitoring interface
Operator shift logging
Audio alerts
Engineering-oriented system visualization

The digital prototype acts as a testbed for the proposed monitoring architecture before physical sensor-node deployment.

🧠 Key Features
1. 3D Conveyor Visualization

The application provides an interactive 3D representation of the conveyor environment using Three.js.

This provides a visual foundation for representing conveyor components and sensor locations within the digital prototype.

2. Live Telemetry Simulation

The prototype includes simulated telemetry to demonstrate how conveyor parameters can be monitored.

Example parameters include:

Temperature
Vibration
RPM / Speed
Sensor Health
Conveyor Condition

The simulated environment allows abnormal conditions to be introduced without requiring physical equipment.

3. Scenario-Based Testing

Controlled abnormal scenarios can be simulated to observe the response of the monitoring system.

Normal Condition
       ↓
Abnormal Parameter
       ↓
Condition Assessment
       ↓
Warning / Alarm
       ↓
Operator Response
       ↓
Maintenance

This allows the proposed monitoring workflow to be demonstrated safely in a digital environment.

4. ML / Analytics Layer

The interface includes an analytics layer intended to support conveyor condition assessment and future predictive-maintenance models.

The architecture is designed to accommodate:

Anomaly detection
Condition classification
Degradation analysis
Failure-risk estimation
Predictive maintenance recommendations

The current prototype should be treated as an AI/ML-ready digital architecture, rather than a field-validated predictive model.

5. Telemetry Replay

Historical or simulated telemetry can be replayed through the prototype to visualize how conveyor conditions evolve over time.

This provides a foundation for testing monitoring and decision-support workflows.

6. Splice Monitoring

The prototype includes a splice-oriented monitoring interface for representing conveyor belt joint condition and maintenance information.

This directly supports the project's focus on belt joint rupture and damage.

7. Emergency Interlock

An emergency interlock interface is included to demonstrate how abnormal conveyor conditions could be connected to operational safety workflows.

The current implementation is part of the digital prototype.

8. OT Security Monitoring

The prototype includes an OT security monitoring interface to represent cybersecurity considerations for connected industrial monitoring systems.

🔬 Engineering & Simulation Philosophy

CONVEX AI is designed around the principle:

Test digitally → Validate the architecture → Build hardware → Deploy in the field

The digital prototype provides a controlled environment in which system behaviour, telemetry workflows and monitoring concepts can be evaluated before physical deployment.

Future engineering validation will involve real sensor measurements and field data.

🧩 Technology Stack
Frontend
React
TypeScript
Vite
3D & Visualization
Three.js
React-based 3D components
Interactive telemetry visualization
UI & Styling
Tailwind CSS
Lucide React
Utilities
Canvas Confetti
TypeScript
ESLint / Oxlint

⚙️ Getting Started
Prerequisites

Install:

Node.js
npm

Verify the installation:

node --version
npm --version
Installation

Clone the repository:

git clone https://github.com/<your-username>/CONVEX-AI.git

Enter the project directory:

cd CONVEX-AI

Install dependencies:

npm install

▶️ Run Locally

Start the development server:

npm run dev

Open the local URL provided by Vite, typically:

http://localhost:5173

🏗️ Production Build

Create a production build:

npm run build

Preview the production build:

npm run preview

☁️ Deployment

CONVEX AI is a Vite-based frontend application and can be deployed using Vercel or another static frontend hosting platform.

Vercel

Recommended configuration:

Framework: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install

Once the GitHub repository is connected to Vercel, updates pushed to the deployment branch can automatically trigger a new deployment.

🔮 Future Development

The current digital prototype represents the software and simulation layer of the proposed CONVEX AI system.

The next development stages include:

Hardware
ESP32-based sensor nodes
Vibration sensors
Strain / tension sensors
Temperature sensors
RPM / speed sensors
LoRa communication
Autonomous power system
Industrial protective enclosure
AI / Predictive Maintenance

Future versions will use real conveyor data to develop and validate machine-learning models for:

Anomaly detection
Fault classification
Degradation tracking
Failure-risk prediction
Maintenance recommendation
Field Deployment
Digital Prototype
       ↓
Hardware Prototype
       ↓
Sensor Validation
       ↓
Pilot Deployment
       ↓
Real Conveyor Data
       ↓
Model Training
       ↓
Predictive Maintenance
Alerting

Future deployment can integrate:

Remote alerts
SMS notifications
Maintenance notifications
Gateway-based alerts
Local emergency indicators

⚠️ Prototype Status
Component	Status
React web application	✅ Implemented
3D conveyor visualization	✅ Implemented
Simulated telemetry	✅ Implemented
Scenario-based simulation	✅ Implemented
Telemetry replay	✅ Implemented
Monitoring interface	✅ Implemented
Splice monitoring interface	✅ Implemented
Emergency interlock interface	✅ Prototype
OT security interface	✅ Prototype
Physical sensor nodes	🔄 Future
Real LoRa sensor network	🔄 Future
Real sensor telemetry	🔄 Future
Field deployment	🔄 Future
Trained predictive ML model	🔄 Future
Real SMS alerting	🔄 Future

Note: The current repository demonstrates the digital prototype and software architecture of CONVEX AI. Physical sensor acquisition, field deployment and production-grade predictive models are planned future stages.

🎯 Expected Impact

CONVEX AI aims to support:

Safer mining operations through earlier identification of abnormal conveyor conditions
Reduced unplanned downtime through condition-based maintenance
Better maintenance decisions using continuous condition information
Reduced material loss through earlier detection of belt problems
Improved asset utilization through data-driven monitoring
Scalable monitoring across multiple conveyor sections

🌍 Sustainable Development Goals

The proposed solution aligns with:

SDG 3 — Good Health and Well-being
SDG 9 — Industry, Innovation and Infrastructure
SDG 12 — Responsible Consumption and Production
SDG 13 — Climate Action

🏆 Smart India Hackathon 2026

Problem Statement: SIH26008

Ministry: Ministry of Steel

Category: Hardware

Theme: Smart Automation

Problem:

Intelligent Monitoring and Prediction of Conveyor Belt Joint Rupture and Damages in Iron Ore Mining Industry

👥 Team IronPulse

CONVEX AI is developed by Team IronPulse for Smart India Hackathon 2026.

The project combines expertise across:

Electrical & Electronics Engineering
Computer Science
Embedded Systems
IoT
Industrial Automation
Data Analytics
3D Visualization
Predictive Maintenance

📌 Project Vision

Detect deterioration early. Predict potential failure. Plan maintenance before rupture.

CONVEX AI aims to bridge the gap between conventional conveyor inspection and intelligent, data-driven predictive maintenance.
