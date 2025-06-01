import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  BookOpen, 
  Microscope, 
  Baby, 
  Lock,
  Heart,
  Brain,
  Bone,
  Eye
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  description: string;
  icon: any;
  topicCount: number;
  color: string;
}

interface Topic {
  id: number;
  name: string;
  category: string;
  type: 'gross_anatomy' | 'histology' | 'embryology';
  content: string;
  accessTier: 'free' | 'starter' | 'premium';
  lastUpdated: string;
}

export default function Notes() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('gross_anatomy');

  // Mock user subscription - in production this would come from auth context
  const userTier = 'free'; // free, starter, premium

  const categories: Category[] = [
    {
      id: 1,
      name: 'Anatomy',
      description: 'Human body structure and organization',
      icon: Bone,
      topicCount: 45,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Physiology',
      description: 'Body functions and processes',
      icon: Heart,
      topicCount: 32,
      color: 'red'
    },
    {
      id: 3,
      name: 'Pathology',
      description: 'Disease processes and abnormalities',
      icon: Brain,
      topicCount: 28,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Pharmacology',
      description: 'Drug actions and interactions',
      icon: Eye,
      topicCount: 24,
      color: 'green'
    }
  ];

  const anatomyTopics: Topic[] = [
    {
      id: 1,
      name: 'Head and Neck',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Head and Neck

## Subtopics

### Skull (Bones of the skull, foramina, cranial fossae)
- **Bones of the skull**: Frontal, parietal, temporal, occipital, sphenoid, ethmoid
- **Foramina**: Entry and exit points for nerves and vessels
- **Cranial fossae**: Anterior, middle, and posterior fossae

### Scalp and Face
- **Layers of scalp**: Skin, connective tissue, aponeurosis, loose tissue, pericranium
- **Facial muscles**: Muscles of expression and mastication
- **Facial vessels and nerves**: Trigeminal and facial nerve distributions

### Parotid Region
- **Parotid gland**: Largest salivary gland
- **Facial nerve course**: Through parotid gland
- **Parotid duct**: Stensen's duct opening

### Temporal and Infratemporal Fossae
- **Boundaries and contents**: Muscles of mastication
- **Pterygoid muscles**: Medial and lateral pterygoid
- **Maxillary artery**: Terminal branch of external carotid

### Orbit and Eyeball
- **Orbital walls**: Seven bones forming the orbit
- **Extraocular muscles**: Six muscles controlling eye movement
- **Optic nerve**: CN II pathway and relations

### Nose and Nasal Cavity
- **External nose**: Cartilaginous and bony framework
- **Nasal septum**: Dividing the nasal cavity
- **Paranasal sinuses**: Frontal, maxillary, sphenoid, ethmoid

### Oral Cavity and Palate
- **Hard palate**: Bony roof of mouth
- **Soft palate**: Muscular partition
- **Tongue**: Intrinsic and extrinsic muscles

### Pharynx
- **Nasopharynx**: Superior portion
- **Oropharynx**: Middle portion
- **Laryngopharynx**: Inferior portion

### Larynx
- **Cartilages**: Thyroid, cricoid, arytenoid
- **Vocal cords**: True and false vocal folds
- **Laryngeal muscles**: Intrinsic and extrinsic

### Cervical Fascia
- **Deep cervical fascia**: Investing, pretracheal, prevertebral layers
- **Fascial spaces**: Potential spaces for infection spread

### Posterior Triangle of the Neck
- **Boundaries**: Sternocleidomastoid, trapezius, clavicle
- **Contents**: Accessory nerve, brachial plexus trunks

### Anterior Triangle of the Neck
- **Subdivisions**: Submental, submandibular, carotid, muscular
- **Major vessels**: Carotid arteries, jugular veins

### Thyroid Gland and Trachea
- **Thyroid anatomy**: Lobes, isthmus, relations
- **Trachea**: C-shaped cartilages, relations

### Blood Vessels of the Head and Neck
- **Carotid system**: Common, internal, external carotid arteries
- **Venous drainage**: Internal and external jugular veins

### Cranial Nerves
- **CN I-XII**: Detailed anatomy and functions
- **Clinical testing**: Examination techniques

### Autonomic Ganglia and Pathways
- **Sympathetic chain**: Cervical ganglia
- **Parasympathetic**: Cranial nerve ganglia

### Surface Anatomy of the Head and Neck
- **Palpable landmarks**: Anatomical reference points
- **Clinical examination**: Inspection and palpation techniques`,
      accessTier: 'free',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Upper Limb',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Upper Limb

## Subtopics

### Bones of the Upper Limb
- **Clavicle**: S-shaped bone connecting upper limb to axial skeleton
- **Scapula**: Triangular bone providing muscle attachment
- **Humerus**: Long bone of the arm with head, shaft, and condyles
- **Radius**: Lateral forearm bone, rotates during pronation/supination
- **Ulna**: Medial forearm bone, forms main elbow joint
- **Hand**: Carpals, metacarpals, and phalanges

### Joints of the Upper Limb
- **Shoulder**: Glenohumeral joint with greatest range of motion
- **Elbow**: Hinge joint between humerus, radius, and ulna
- **Wrist**: Complex joint between forearm and hand
- **Hand**: Metacarpophalangeal and interphalangeal joints

### Pectoral Region
- **Pectoralis major**: Large fan-shaped muscle
- **Pectoralis minor**: Smaller muscle beneath pectoralis major
- **Subclavius**: Small muscle below clavicle
- **Serratus anterior**: Muscle on lateral chest wall

### Axilla
- **Boundaries**: Anterior, posterior, medial, lateral walls
- **Contents**: Axillary vessels, nerves, lymph nodes
- **Clinical significance**: Lymphatic drainage pathway

### Brachial Plexus
- **Roots**: C5-T1 nerve roots
- **Trunks**: Superior, middle, inferior
- **Divisions**: Anterior and posterior
- **Cords**: Lateral, posterior, medial
- **Terminal branches**: Major nerves of upper limb

### Arm (Anterior and Posterior Compartments)
- **Anterior compartment**: Flexor muscles (biceps, brachialis, coracobrachialis)
- **Posterior compartment**: Extensor muscles (triceps)
- **Neurovascular structures**: Brachial artery, median nerve

### Cubital Fossa
- **Boundaries**: Brachioradialis and pronator teres
- **Contents**: Brachial artery, median nerve, tendon of biceps
- **Clinical significance**: Venipuncture site

### Forearm (Anterior and Posterior Compartments)
- **Anterior compartment**: Flexor muscles in superficial and deep layers
- **Posterior compartment**: Extensor muscles
- **Interosseous membrane**: Connects radius and ulna

### Hand (Palmar and Dorsal Aspects)
- **Palmar aspect**: Thenar, hypothenar, and central compartments
- **Dorsal aspect**: Extensor tendons and dorsal interossei
- **Intrinsic muscles**: Fine motor control and precision grip

### Arteries, Veins, and Lymphatics
- **Arterial supply**: Subclavian, axillary, brachial, radial, ulnar arteries
- **Venous drainage**: Deep and superficial venous systems
- **Lymphatic drainage**: Axillary lymph nodes

### Cutaneous Innervation
- **Dermatomes**: Segmental nerve supply patterns
- **Peripheral nerves**: Cutaneous branches and territories

### Surface Anatomy of the Upper Limb
- **Palpable landmarks**: Bony prominences and muscle borders
- **Clinical examination**: Inspection, palpation, movement testing`,
      accessTier: 'starter',
      lastUpdated: '2024-01-10'
    },
    {
      id: 3,
      name: 'Thorax',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Thorax

## Subtopics

### Thoracic Wall and Intercostal Spaces
- **Ribs**: 12 pairs of ribs with costal cartilages
- **Intercostal muscles**: External, internal, and innermost layers
- **Intercostal vessels and nerves**: Neurovascular bundles
- **Sternum**: Manubrium, body, and xiphoid process

### Diaphragm
- **Structure**: Central tendon and muscular periphery
- **Openings**: Caval, esophageal, and aortic hiatuses
- **Innervation**: Phrenic nerve (C3-C5)
- **Function**: Primary muscle of respiration

### Pleura and Lungs
- **Pleural layers**: Visceral and parietal pleura
- **Pleural cavities**: Potential spaces around each lung
- **Lung lobes**: Right (3 lobes), Left (2 lobes)
- **Bronchial tree**: Trachea, bronchi, and bronchioles

### Mediastinum
- **Superior mediastinum**: Above sternal angle
- **Anterior mediastinum**: In front of pericardium
- **Middle mediastinum**: Contains heart and pericardium
- **Posterior mediastinum**: Behind pericardium

### Pericardium
- **Fibrous pericardium**: Outer tough layer
- **Serous pericardium**: Parietal and visceral layers
- **Pericardial cavity**: Potential space with serous fluid

### Heart (External and Internal Features, Conducting System)
- **External features**: Surfaces, borders, and sulci
- **Internal features**: Chambers, valves, and septae
- **Conducting system**: SA node, AV node, bundle of His, Purkinje fibers
- **Coronary circulation**: Right and left coronary arteries

### Great Vessels of the Thorax
- **Aorta**: Ascending, arch, and descending portions
- **Pulmonary vessels**: Pulmonary trunk and veins
- **Venae cavae**: Superior and inferior vena cava
- **Brachiocephalic vessels**: Arteries and veins

### Esophagus and Thoracic Duct
- **Esophagus**: Course through thorax and relations
- **Thoracic duct**: Main lymphatic vessel
- **Lymphatic drainage**: Thoracic and abdominal lymphatics

### Nerves of the Thorax
- **Vagus nerve**: Left and right vagus nerves
- **Phrenic nerve**: Motor to diaphragm
- **Sympathetic trunk**: Thoracic sympathetic ganglia
- **Intercostal nerves**: Segmental innervation

### Surface Anatomy of the Thorax
- **Surface markings**: Anatomical landmarks
- **Clinical examination**: Inspection, palpation, percussion, auscultation`,
      accessTier: 'starter',
      lastUpdated: '2024-01-12'
    },
    {
      id: 4,
      name: 'Abdomen',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Abdomen

## Subtopics

### Anterior Abdominal Wall
- **Muscles**: External oblique, internal oblique, transversus abdominis, rectus abdominis
- **Fasciae**: Superficial and deep fasciae
- **Linea alba**: Midline tendinous intersection
- **Rectus sheath**: Aponeurotic covering of rectus abdominis

### Inguinal Region and Inguinal Canal
- **Inguinal canal**: Oblique passage through abdominal wall
- **Inguinal ligament**: Lower border of external oblique aponeurosis
- **Spermatic cord**: Contents in males
- **Round ligament**: Homologous structure in females

### Peritoneum and Peritoneal Cavity
- **Parietal peritoneum**: Lines abdominal wall
- **Visceral peritoneum**: Covers organs
- **Peritoneal cavity**: Potential space with peritoneal fluid
- **Mesenteries**: Double layers connecting organs to posterior wall

### Stomach
- **Parts**: Fundus, body, antrum, pylorus
- **Curvatures**: Greater and lesser curvatures
- **Relations**: Surrounding structures
- **Blood supply**: Celiac trunk branches

### Small and Large Intestines
- **Small intestine**: Duodenum, jejunum, ileum
- **Large intestine**: Cecum, colon, rectum
- **Mesenteries**: Mesentery proper, mesocolon
- **Blood supply**: Superior and inferior mesenteric arteries

### Liver and Biliary Apparatus
- **Liver lobes**: Right, left, quadrate, caudate
- **Biliary tree**: Hepatic ducts, cystic duct, common bile duct
- **Gallbladder**: Storage and concentration of bile
- **Portal circulation**: Hepatic portal vein system

### Pancreas
- **Parts**: Head, neck, body, tail
- **Ducts**: Main pancreatic duct, accessory duct
- **Relations**: Surrounding structures
- **Functions**: Exocrine and endocrine

### Spleen
- **Location**: Left hypochondrium
- **Relations**: Diaphragm, stomach, kidney
- **Functions**: Immune and hematologic
- **Blood supply**: Splenic artery

### Kidneys and Suprarenal Glands
- **Kidney structure**: Cortex, medulla, hilum
- **Renal vessels**: Renal arteries and veins
- **Suprarenal glands**: Cortex and medulla
- **Retroperitoneal position**: Behind parietal peritoneum

### Abdominal Aorta and IVC
- **Abdominal aorta**: Branches and relations
- **Inferior vena cava**: Formation and tributaries
- **Major branches**: Celiac, mesenteric, renal arteries

### Lumbar Plexus
- **Formation**: L1-L4 nerve roots
- **Major branches**: Femoral, obturator, lateral femoral cutaneous nerves
- **Relations**: Within psoas major muscle

### Posterior Abdominal Wall
- **Muscles**: Psoas major, quadratus lumborum, iliacus
- **Fascia**: Fascia covering posterior wall muscles
- **Vessels and nerves**: Posterior relations

### Surface Anatomy of the Abdomen
- **Regions**: Nine regions or four quadrants
- **Surface markings**: Palpable landmarks
- **Clinical examination**: Systematic approach`,
      accessTier: 'premium',
      lastUpdated: '2024-01-11'
    },
    {
      id: 5,
      name: 'Pelvis and Perineum',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Pelvis and Perineum

## Subtopics

### Bones and Joints of the Pelvis
- **Hip bone**: Ilium, ischium, and pubis
- **Sacrum**: Five fused vertebrae
- **Coccyx**: Tailbone
- **Sacroiliac joint**: Joint between sacrum and ilium
- **Pubic symphysis**: Midline cartilaginous joint

### Pelvic Diaphragm and Muscles
- **Levator ani**: Main muscle of pelvic floor
- **Coccygeus**: Posterior pelvic floor muscle
- **Urogenital diaphragm**: Muscles in urogenital triangle
- **Pelvic fascia**: Supporting connective tissue

### Urinary Bladder and Urethra
- **Bladder anatomy**: Detrusor muscle, trigone
- **Male urethra**: Prostatic, membranous, spongy parts
- **Female urethra**: Shorter, simpler structure
- **Sphincters**: Internal and external urethral sphincters

### Rectum and Anal Canal
- **Rectum**: Terminal portion of large intestine
- **Anal canal**: Final portion of digestive tract
- **Anal sphincters**: Internal and external
- **Houston's valves**: Transverse rectal folds

### Male Internal Genital Organs
- **Prostate gland**: Surrounds prostatic urethra
- **Seminal vesicles**: Contribute to seminal fluid
- **Vas deferens**: Sperm transport duct
- **Ejaculatory ducts**: Final sperm pathway

### Female Internal Genital Organs
- **Uterus**: Body, fundus, cervix
- **Uterine tubes**: Fallopian tubes
- **Ovaries**: Female gonads
- **Vagina**: Birth canal and copulatory organ

### Perineum and its Subdivisions
- **Urogenital triangle**: Anterior subdivision
- **Anal triangle**: Posterior subdivision
- **Perineal body**: Central tendon
- **Boundaries**: Defined by bony landmarks

### Urogenital Triangle
- **External genitalia**: Penis/clitoris, scrotum/labia
- **Bulbospongiosus muscle**: Surrounds bulb of penis/vestibule
- **Ischiocavernosus muscle**: Covers crura
- **Superficial transverse perineal muscle**: Stabilizes perineal body

### Anal Triangle
- **External anal sphincter**: Voluntary control
- **Ischioanal fossae**: Fat-filled spaces
- **Pudendal canal**: Alcock's canal
- **Anal columns**: Longitudinal mucosal folds

### Blood Vessels and Nerves of the Pelvis
- **Internal iliac artery**: Main pelvic arterial supply
- **Pudendal nerve**: Motor and sensory to perineum
- **Pelvic splanchnic nerves**: Parasympathetic supply
- **Sacral plexus**: L4-S4 nerve roots

### Surface Anatomy of the Pelvis and Perineum
- **Palpable landmarks**: Iliac crests, pubic symphysis
- **Clinical examination**: Bimanual examination techniques`,
      accessTier: 'premium',
      lastUpdated: '2024-01-09'
    },
    {
      id: 6,
      name: 'Lower Limb',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Lower Limb

## Subtopics

### Bones of the Lower Limb
- **Hip bone**: Ilium, ischium, pubis forming acetabulum
- **Femur**: Longest bone with head, neck, shaft, condyles
- **Tibia**: Weight-bearing bone of leg
- **Fibula**: Non-weight-bearing lateral bone
- **Foot**: Tarsals, metatarsals, phalanges

### Joints of the Lower Limb
- **Hip**: Ball and socket joint with strong ligaments
- **Knee**: Complex hinge joint with menisci
- **Ankle**: Hinge joint between leg and foot
- **Foot**: Multiple joints for adaptation and propulsion

### Gluteal Region
- **Gluteus maximus**: Largest muscle, hip extension
- **Gluteus medius and minimus**: Hip abductors
- **Deep muscles**: Piriformis, obturator internus, gemelli
- **Sciatic nerve**: Largest nerve, exits through greater sciatic foramen

### Thigh (Anterior, Medial, and Posterior Compartments)
- **Anterior compartment**: Quadriceps femoris, knee extension
- **Medial compartment**: Adductor muscles, hip adduction
- **Posterior compartment**: Hamstrings, hip extension, knee flexion
- **Femoral triangle**: Contains femoral vessels and nerve

### Popliteal Fossa
- **Boundaries**: Biceps femoris, semimembranosus, gastrocnemius
- **Contents**: Popliteal vessels, tibial and common fibular nerves
- **Clinical significance**: Pulse palpation, nerve blocks

### Leg (Anterior, Lateral, and Posterior Compartments)
- **Anterior compartment**: Dorsiflexors of foot
- **Lateral compartment**: Foot evertors
- **Posterior compartment**: Plantarflexors, superficial and deep layers
- **Interosseous membrane**: Connects tibia and fibula

### Foot (Dorsum and Sole)
- **Dorsum**: Extensor tendons, dorsalis pedis artery
- **Sole**: Four layers of muscles, plantar arches
- **Arches**: Longitudinal and transverse arches
- **Plantar fascia**: Supporting aponeurosis

### Arteries, Veins, and Lymphatics
- **Arterial supply**: Femoral, popliteal, anterior/posterior tibial arteries
- **Venous drainage**: Deep and superficial venous systems
- **Lymphatic drainage**: Inguinal and popliteal lymph nodes

### Cutaneous Innervation
- **Dermatomes**: L1-S2 segmental supply
- **Peripheral nerves**: Cutaneous branches and territories
- **Clinical testing**: Sensory examination techniques

### Surface Anatomy of the Lower Limb
- **Palpable landmarks**: Bony prominences, muscle borders
- **Clinical examination**: Gait analysis, joint testing`,
      accessTier: 'premium',
      lastUpdated: '2024-01-08'
    },
    {
      id: 7,
      name: 'Neuroanatomy',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Neuroanatomy

## Subtopics

### Organization of the Nervous System
- **Central nervous system**: Brain and spinal cord
- **Peripheral nervous system**: Cranial and spinal nerves
- **Autonomic nervous system**: Sympathetic and parasympathetic
- **Somatic nervous system**: Motor and sensory components

### Meninges and Cerebrospinal Fluid
- **Dura mater**: Tough outer layer
- **Arachnoid mater**: Middle web-like layer
- **Pia mater**: Thin inner layer
- **CSF circulation**: Production, flow, and absorption

### Spinal Cord (Gross Anatomy, Tracts, Blood Supply)
- **External anatomy**: Enlargements, sulci, roots
- **Internal anatomy**: Gray and white matter organization
- **Ascending tracts**: Sensory pathways to brain
- **Descending tracts**: Motor pathways from brain
- **Blood supply**: Anterior and posterior spinal arteries

### Brainstem (Medulla, Pons, Midbrain)
- **Medulla oblongata**: Vital centers, pyramids, olives
- **Pons**: Relay station, cranial nerve nuclei
- **Midbrain**: Superior and inferior colliculi, substantia nigra
- **Reticular formation**: Consciousness and arousal

### Cerebellum
- **Anatomy**: Vermis, hemispheres, peduncles
- **Functions**: Balance, coordination, motor learning
- **Connections**: Input and output pathways
- **Clinical correlations**: Ataxia, dysmetria

### Diencephalon (Thalamus, Hypothalamus)
- **Thalamus**: Relay station for sensory information
- **Hypothalamus**: Homeostasis, hormone regulation
- **Epithalamus**: Pineal gland, habenula
- **Subthalamus**: Motor control components

### Cerebral Hemispheres (Lobes, Functional Areas)
- **Frontal lobe**: Motor, executive, personality functions
- **Parietal lobe**: Sensory processing, spatial awareness
- **Temporal lobe**: Auditory, memory, language
- **Occipital lobe**: Visual processing

### Basal Ganglia
- **Components**: Caudate, putamen, globus pallidus
- **Connections**: Cortico-basal ganglia loops
- **Functions**: Motor control, habit formation
- **Clinical disorders**: Parkinson's, Huntington's disease

### Limbic System
- **Components**: Hippocampus, amygdala, cingulate cortex
- **Functions**: Memory, emotion, behavior
- **Connections**: Papez circuit
- **Clinical significance**: Alzheimer's disease, depression

### Cranial Nerves
- **CN I-XII**: Individual anatomy and functions
- **Brainstem attachments**: Entry and exit points
- **Functional components**: Motor, sensory, autonomic
- **Clinical testing**: Systematic examination

### Autonomic Nervous System
- **Sympathetic division**: Thoracolumbar outflow
- **Parasympathetic division**: Craniosacral outflow
- **Ganglia**: Sympathetic chain, collateral, terminal
- **Neurotransmitters**: ACh, norepinephrine

### Ventricles of the Brain
- **Lateral ventricles**: Largest, C-shaped
- **Third ventricle**: Between thalami
- **Fourth ventricle**: Between brainstem and cerebellum
- **CSF flow**: Choroid plexus to subarachnoid space

### Arterial Supply (Circle of Willis)
- **Internal carotid system**: Anterior circulation
- **Vertebrobasilar system**: Posterior circulation
- **Circle of Willis**: Arterial anastomosis
- **Watershed areas**: Border zones between territories

### Venous Drainage (Dural Sinuses)
- **Superficial veins**: Cortical drainage
- **Deep veins**: Internal cerebral veins
- **Dural sinuses**: Superior sagittal, transverse, sigmoid
- **Clinical significance**: Thrombosis, hemorrhage`,
      accessTier: 'premium',
      lastUpdated: '2024-01-07'
    },
    {
      id: 8,
      name: 'Cardiovascular Histology',
      category: 'Anatomy',
      type: 'histology',
      content: `# Cardiovascular Histology

## Overview
The cardiovascular system consists of the heart and blood vessels, each with distinct histological features adapted to their functions.

## Heart Histology

### Cardiac Muscle
- **Cardiomyocytes**: Specialized muscle cells with intercalated discs
- **Intercalated discs**: Cell junctions containing gap junctions and desmosomes
- **T-tubules**: Allow rapid depolarization throughout the cell
- **Abundant mitochondria**: Support high energy demands

### Heart Layers
- **Epicardium**: Outer layer (visceral pericardium)
- **Myocardium**: Middle muscular layer
- **Endocardium**: Inner lining, continuous with blood vessel endothelium

## Blood Vessel Histology

### Arteries
- **Tunica intima**: Endothelium and internal elastic lamina
- **Tunica media**: Smooth muscle and elastic fibers
- **Tunica adventitia**: Connective tissue and vasa vasorum

### Capillaries
- **Continuous capillaries**: Tight junctions, blood-brain barrier
- **Fenestrated capillaries**: Pores for filtration (kidneys, endocrine glands)
- **Sinusoidal capillaries**: Large gaps for cell passage (liver, spleen)

### Veins
- **Thinner walls**: Less smooth muscle than arteries
- **Valves**: Prevent backflow in larger veins
- **Larger lumens**: Accommodate blood return to heart

## Specialized Structures
- **Cardiac conduction system**: Modified cardiac muscle cells
- **Baroreceptors**: Pressure sensors in vessel walls
- **Lymphatic vessels**: One-way drainage system

## Pathological Changes
- **Atherosclerosis**: Plaque formation in arteries
- **Hypertrophy**: Enlarged cardiac muscle
- **Thrombosis**: Blood clot formation`,
      accessTier: 'premium',
      lastUpdated: '2024-01-12'
    }
  ];

  const canAccessContent = (accessTier: string) => {
    if (accessTier === 'free') return true;
    if (accessTier === 'starter' && (userTier === 'starter' || userTier === 'premium')) return true;
    if (accessTier === 'premium' && userTier === 'premium') return true;
    return false;
  };

  const getAccessBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium</Badge>;
      case 'starter':
        return <Badge className="bg-docdot-blue text-white">Starter</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const filteredTopics = anatomyTopics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    topic.type === activeTab
  );

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setSelectedTopic(null)}>
              <ArrowLeft className="mr-2" size={16} />
              Back to Topics
            </Button>
            <div className="flex items-center space-x-2">
              {getAccessBadge(selectedTopic.accessTier)}
              <span className="text-docdot-text text-sm">
                Updated: {new Date(selectedTopic.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-docdot-heading">
                {selectedTopic.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canAccessContent(selectedTopic.accessTier) ? (
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-docdot-text leading-relaxed">
                    {selectedTopic.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold text-docdot-heading mb-2">
                    Premium Content
                  </h3>
                  <p className="text-docdot-text mb-6">
                    This content requires a {selectedTopic.accessTier} subscription to access.
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-docdot-blue">
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="mr-2" size={16} />
                Back to Categories
              </Button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-docdot-heading">{selectedCategory.name} Notes</h1>
                <p className="text-docdot-text">{selectedCategory.description}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Topic Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="gross_anatomy" className="flex items-center space-x-2">
                <Bone size={16} />
                <span>Gross Anatomy</span>
              </TabsTrigger>
              <TabsTrigger value="histology" className="flex items-center space-x-2">
                <Microscope size={16} />
                <span>Histology</span>
              </TabsTrigger>
              <TabsTrigger value="embryology" className="flex items-center space-x-2">
                <Baby size={16} />
                <span>Embryology</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <Card 
                    key={topic.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-docdot-heading">{topic.name}</CardTitle>
                        {!canAccessContent(topic.accessTier) && (
                          <Lock className="text-gray-400" size={16} />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {getAccessBadge(topic.accessTier)}
                        <span className="text-xs text-docdot-text">
                          {new Date(topic.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-docdot-text text-sm line-clamp-3">
                        {topic.content.substring(0, 100)}...
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        {canAccessContent(topic.accessTier) ? 'Read More' : 'Upgrade to Access'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredTopics.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold text-docdot-heading mb-2">
                    No topics found
                  </h3>
                  <p className="text-docdot-text">
                    Try adjusting your search or explore other categories.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-docdot-bg">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-docdot-heading mb-4">Study Notes</h1>
          <p className="text-xl text-docdot-text">Comprehensive medical education materials</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-docdot-blue"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                      <IconComponent className={`text-${category.color}-600`} size={32} />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-docdot-heading">{category.name}</CardTitle>
                      <p className="text-docdot-text">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-docdot-text">{category.topicCount} topics available</span>
                    <Button variant="outline" size="sm">
                      Explore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}