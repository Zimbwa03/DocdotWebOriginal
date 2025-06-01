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
  subtopics?: Subtopic[];
}

interface Subtopic {
  id: string;
  name: string;
  description?: string;
  content?: string;
}

export default function Notes() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
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
      content: `# Head and Neck - Overview

The head and neck region contains vital structures for sensation, communication, and survival. Select a subtopic below to study specific anatomical regions in detail.`,
      accessTier: 'free',
      lastUpdated: '2024-01-15',
      subtopics: [
        {
          id: 'skull',
          name: 'Skull',
          description: 'Bones of the skull, foramina, cranial fossae',
          content: `# Skull

## Bones of the Skull
- **Frontal bone**: Forms forehead and roof of orbits
- **Parietal bones**: Form sides and roof of skull  
- **Temporal bones**: House ear structures
- **Occipital bone**: Forms back of skull
- **Sphenoid**: Central skull base bone
- **Ethmoid**: Forms part of nasal cavity

## Foramina
- **Foramen magnum**: Spinal cord passage
- **Optic canal**: Optic nerve passage
- **Superior orbital fissure**: Multiple cranial nerves
- **Foramen rotundum**: Maxillary nerve
- **Foramen ovale**: Mandibular nerve

## Cranial Fossae  
- **Anterior fossa**: Frontal lobes
- **Middle fossa**: Temporal lobes
- **Posterior fossa**: Cerebellum and brainstem`
        },
        {
          id: 'scalp-face',
          name: 'Scalp and Face',
          description: 'Layers, muscles, vessels, and nerves',
          content: `# Scalp and Face

## Scalp Layers (SCALP)
- **S**: Skin
- **C**: Connective tissue (subcutaneous)
- **A**: Aponeurosis (galea aponeurotica)
- **L**: Loose connective tissue
- **P**: Pericranium

## Facial Muscles
- **Muscles of expression**: Controlled by facial nerve (CN VII)
- **Muscles of mastication**: Controlled by trigeminal nerve (CN V)
- **Orbicularis oculi**: Eye closure
- **Orbicularis oris**: Lip closure

## Blood Supply
- **Facial artery**: Main facial blood supply
- **Superficial temporal artery**: Temple region
- **Maxillary artery**: Deep facial structures`
        },
        {
          id: 'parotid',
          name: 'Parotid Region',
          description: 'Parotid gland and facial nerve course'
        },
        {
          id: 'temporal-infratemporal',
          name: 'Temporal and Infratemporal Fossae',
          description: 'Boundaries, contents, muscles of mastication'
        },
        {
          id: 'orbit-eyeball',
          name: 'Orbit and Eyeball',
          description: 'Orbital walls, extraocular muscles, optic nerve'
        },
        {
          id: 'nose-nasal',
          name: 'Nose and Nasal Cavity',
          description: 'External nose, nasal septum, paranasal sinuses'
        },
        {
          id: 'oral-palate',
          name: 'Oral Cavity and Palate',
          description: 'Hard palate, soft palate, tongue'
        },
        {
          id: 'pharynx',
          name: 'Pharynx',
          description: 'Nasopharynx, oropharynx, laryngopharynx'
        },
        {
          id: 'larynx',
          name: 'Larynx',
          description: 'Cartilages, vocal cords, laryngeal muscles'
        },
        {
          id: 'cervical-fascia',
          name: 'Cervical Fascia',
          description: 'Deep cervical fascia layers and fascial spaces'
        },
        {
          id: 'posterior-triangle',
          name: 'Posterior Triangle of the Neck',
          description: 'Boundaries, contents, accessory nerve'
        },
        {
          id: 'anterior-triangle',
          name: 'Anterior Triangle of the Neck',
          description: 'Subdivisions and major vessels'
        },
        {
          id: 'thyroid-trachea',
          name: 'Thyroid Gland and Trachea',
          description: 'Thyroid anatomy and tracheal relations'
        },
        {
          id: 'blood-vessels',
          name: 'Blood Vessels of the Head and Neck',
          description: 'Carotid system and venous drainage'
        },
        {
          id: 'cranial-nerves',
          name: 'Cranial Nerves',
          description: 'CN I-XII anatomy and clinical testing'
        },
        {
          id: 'autonomic',
          name: 'Autonomic Ganglia and Pathways',
          description: 'Sympathetic chain and parasympathetic ganglia'
        },
        {
          id: 'surface-anatomy',
          name: 'Surface Anatomy of the Head and Neck',
          description: 'Palpable landmarks and clinical examination'
        }
      ]
    },
    {
      id: 2,
      name: 'Upper Limb',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Upper Limb - Overview

The upper limb is designed for manipulation and interaction with the environment. Select a subtopic below to study specific anatomical regions in detail.`,
      accessTier: 'free',
      lastUpdated: '2024-01-10',
      subtopics: [
        {
          id: 'upper-limb-bones',
          name: 'Bones of the Upper Limb',
          description: 'Clavicle, scapula, humerus, radius, ulna, hand',
          content: `
            <div class="space-y-8">
              <!-- Clavicle Section -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500">
                <h2 class="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">📌 Clavicle Bone</h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Overview</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">The clavicle, commonly known as the collarbone, is one of the bones of the upper limb girdle. Together with the scapula, it forms the shoulder girdle.</p>
                    
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Location & Anatomy</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">The clavicle is a long, thin bone that lies horizontally at the base of the neck. It is located anteriorly and superiorly on the thorax.</p>
                    
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Landmarks:</h4>
                      <ul class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>• <strong>Medial end:</strong> Articulates with the sternum</li>
                        <li>• <strong>Lateral end:</strong> Articulates with the acromion of the scapula</li>
                        <li>• <strong>Undersurface:</strong> Site for coracoclavicular ligament attachment</li>
                        <li>• <strong>Articular surfaces:</strong> For acromion and sternum</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Structure & Relations</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">The clavicle is an S-shaped bone that articulates with the sternum at the sternoclavicular joint and with the acromion of the scapula at the acromioclavicular joint.</p>
                    
                    <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <h4 class="font-semibold text-green-800 dark:text-green-300 mb-2">Muscle Attachments:</h4>
                      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• Deltoid</li>
                        <li>• Pectoralis major</li>
                        <li>• Subclavius</li>
                        <li>• Sternocleidomastoid</li>
                        <li>• Trapezius</li>
                      </ul>
                    </div>
                    
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Clinical Relevance</h3>
                    <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• <strong>Fractures:</strong> Common injury site</li>
                        <li>• <strong>Surface Anatomy:</strong> Easily palpated throughout length</li>
                        <li>• <strong>Thoracic Outlet:</strong> Forms anterior boundary</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scapula Section -->
              <div class="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-500">
                <h2 class="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">📌 Scapula Bone</h2>
                
                <div class="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Overview</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">The scapula, commonly known as the shoulder blade, is a key bone of the upper limb girdle. It is a flat, triangular bone that lies on the posterior aspect of the thorax.</p>
                    
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Location & Anatomy</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-4">The scapula is situated on the upper part of the posterior surface of the thorax, typically between the 2nd and 7th ribs.</p>
                    
                    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Landmarks:</h4>
                      <ul class="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <li>• <strong>Superior angle:</strong> Level of T2 vertebra</li>
                        <li>• <strong>Inferior angle:</strong> Level of T7 vertebra and 7th rib</li>
                        <li>• <strong>Spine:</strong> Prominent subcutaneous projection</li>
                        <li>• <strong>Acromion:</strong> Lateral end of spine</li>
                        <li>• <strong>Coracoid process:</strong> Projects upward and forward</li>
                        <li>• <strong>Glenoid cavity:</strong> Pear-shaped cavity for humerus</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <h4 class="font-semibold text-green-800 dark:text-green-300 mb-2">Rotator Cuff Muscles (SITS):</h4>
                      <ul class="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• <strong>S</strong>upraspinatus</li>
                        <li>• <strong>I</strong>nfraspinatus</li>
                        <li>• <strong>T</strong>eres minor</li>
                        <li>• <strong>S</strong>ubscapularis</li>
                      </ul>
                    </div>
                    
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Clinical Relevance</h3>
                    <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <ul class="text-sm text-red-700 dark:text-red-300 space-y-2">
                        <li>• <strong>Winged Scapula:</strong> Long thoracic nerve injury</li>
                        <li>• <strong>Fractures:</strong> Usually from severe trauma</li>
                        <li>• <strong>Surface Anatomy:</strong> Inferior angle, spine, acromion palpable</li>
                        <li>• <strong>Rotator Cuff Issues:</strong> Common shoulder problems</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary Table -->
              <div class="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">📊 Quick Reference Table</h2>
                <div class="overflow-x-auto">
                  <table class="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr class="bg-gray-200 dark:bg-gray-700">
                        <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Bone</th>
                        <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Shape</th>
                        <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Key Features</th>
                        <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Articulations</th>
                        <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Clinical Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2 font-semibold">Clavicle</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">S-shaped long bone</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Medial/lateral ends</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Sternum, Scapula</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Common fractures</td>
                      </tr>
                      <tr>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2 font-semibold">Scapula</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Flat triangular</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Spine, glenoid, angles</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Humerus, Clavicle</td>
                        <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">Rotator cuff, winged scapula</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Study Tips -->
              <div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-l-4 border-yellow-500">
                <h2 class="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">💡 Study Tips</h2>
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Memory Aids:</h4>
                    <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• <strong>SITS</strong> for rotator cuff muscles</li>
                      <li>• Clavicle = "Collar" bone (around neck area)</li>
                      <li>• Scapula = "Shoulder blade" (flat like a blade)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Clinical Correlations:</h4>
                    <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Feel your own clavicle and scapula</li>
                      <li>• Practice identifying surface landmarks</li>
                      <li>• Understand fracture patterns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'upper-limb-joints',
          name: 'Joints of the Upper Limb',
          description: 'Shoulder, elbow, wrist, hand joints'
        },
        {
          id: 'pectoral-region',
          name: 'Pectoral Region',
          description: 'Chest muscles and structures'
        },
        {
          id: 'axilla',
          name: 'Axilla',
          description: 'Armpit region anatomy'
        },
        {
          id: 'brachial-plexus',
          name: 'Brachial Plexus',
          description: 'Nerve network supplying upper limb'
        },
        {
          id: 'arm-compartments',
          name: 'Arm (Anterior and Posterior Compartments)',
          description: 'Upper arm muscle compartments'
        },
        {
          id: 'cubital-fossa',
          name: 'Cubital Fossa',
          description: 'Elbow region anatomy'
        },
        {
          id: 'forearm-compartments',
          name: 'Forearm (Anterior and Posterior Compartments)',
          description: 'Forearm muscle compartments'
        },
        {
          id: 'hand-aspects',
          name: 'Hand (Palmar and Dorsal Aspects)',
          description: 'Hand anatomy and muscles'
        },
        {
          id: 'upper-limb-vessels',
          name: 'Arteries, Veins, and Lymphatics',
          description: 'Upper limb circulation'
        },
        {
          id: 'upper-limb-innervation',
          name: 'Cutaneous Innervation',
          description: 'Skin sensation patterns'
        },
        {
          id: 'upper-limb-surface',
          name: 'Surface Anatomy of the Upper Limb',
          description: 'Clinical landmarks and examination'
        }
      ]
    },
    {
      id: 3,
      name: 'Thorax',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Thorax - Overview

The thorax contains vital organs for respiration and circulation. Select a subtopic below to study specific thoracic structures in detail.`,
      accessTier: 'free',
      lastUpdated: '2024-01-12',
      subtopics: [
        {
          id: 'thoracic-wall',
          name: 'Thoracic Wall and Intercostal Spaces',
          description: 'Ribs, intercostal muscles, and neurovascular structures'
        },
        {
          id: 'diaphragm',
          name: 'Diaphragm',
          description: 'Primary muscle of respiration and its openings'
        },
        {
          id: 'pleura-lungs',
          name: 'Pleura and Lungs',
          description: 'Lung anatomy and pleural spaces'
        },
        {
          id: 'mediastinum',
          name: 'Mediastinum',
          description: 'Central chest cavity compartments'
        },
        {
          id: 'pericardium',
          name: 'Pericardium',
          description: 'Heart covering and pericardial cavity'
        },
        {
          id: 'heart-features',
          name: 'Heart (External and Internal Features, Conducting System)',
          description: 'Heart anatomy and electrical conduction'
        },
        {
          id: 'great-vessels',
          name: 'Great Vessels of the Thorax',
          description: 'Major blood vessels in the chest'
        },
        {
          id: 'esophagus-thoracic-duct',
          name: 'Esophagus and Thoracic Duct',
          description: 'Digestive tube and main lymphatic vessel'
        },
        {
          id: 'thoracic-nerves',
          name: 'Nerves of the Thorax',
          description: 'Vagus, phrenic, sympathetic trunk, intercostal nerves'
        },
        {
          id: 'thorax-surface',
          name: 'Surface Anatomy of the Thorax',
          description: 'Clinical landmarks and examination techniques'
        }
      ]
    },
    {
      id: 4,
      name: 'Abdomen',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Abdomen - Overview

The abdomen contains digestive organs, kidneys, and major blood vessels. Select a subtopic below to study specific abdominal structures in detail.`,
      accessTier: 'free',
      lastUpdated: '2024-01-11',
      subtopics: [
        {
          id: 'anterior-wall',
          name: 'Anterior Abdominal Wall',
          description: 'Abdominal muscles and fascial layers'
        },
        {
          id: 'inguinal-region',
          name: 'Inguinal Region and Inguinal Canal',
          description: 'Groin anatomy and hernia sites'
        },
        {
          id: 'peritoneum',
          name: 'Peritoneum and Peritoneal Cavity',
          description: 'Abdominal lining and cavity'
        },
        {
          id: 'stomach',
          name: 'Stomach',
          description: 'Gastric anatomy and relations'
        },
        {
          id: 'intestines',
          name: 'Small and Large Intestines',
          description: 'Bowel anatomy and blood supply'
        },
        {
          id: 'liver-biliary',
          name: 'Liver and Biliary Apparatus',
          description: 'Liver lobes and bile drainage'
        },
        {
          id: 'pancreas',
          name: 'Pancreas',
          description: 'Pancreatic anatomy and ducts'
        },
        {
          id: 'spleen',
          name: 'Spleen',
          description: 'Splenic anatomy and functions'
        },
        {
          id: 'kidneys-adrenals',
          name: 'Kidneys and Suprarenal Glands',
          description: 'Renal anatomy and adrenal glands'
        },
        {
          id: 'aorta-ivc',
          name: 'Abdominal Aorta and IVC',
          description: 'Major abdominal blood vessels'
        },
        {
          id: 'lumbar-plexus',
          name: 'Lumbar Plexus',
          description: 'Nerve network in posterior abdomen'
        },
        {
          id: 'posterior-wall',
          name: 'Posterior Abdominal Wall',
          description: 'Retroperitoneal muscles and structures'
        },
        {
          id: 'abdomen-surface',
          name: 'Surface Anatomy of the Abdomen',
          description: 'Clinical regions and examination'
        }
      ]
    },
    {
      id: 5,
      name: 'Pelvis and Perineum',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Pelvis and Perineum - Overview

The pelvis contains reproductive organs, bladder, rectum, and supporting structures. Select a subtopic below to study specific pelvic and perineal anatomy in detail.`,
      accessTier: 'free',
      subtopics: [
        {
          id: 'pelvic-bones',
          name: 'Bones and Joints of the Pelvis',
          description: 'Hip bone, sacrum, coccyx, and pelvic joints'
        },
        {
          id: 'pelvic-diaphragm',
          name: 'Pelvic Diaphragm and Muscles',
          description: 'Levator ani and pelvic floor muscles'
        },
        {
          id: 'bladder-urethra',
          name: 'Urinary Bladder and Urethra',
          description: 'Urinary system anatomy'
        },
        {
          id: 'rectum-anal',
          name: 'Rectum and Anal Canal',
          description: 'Terminal digestive tract structures'
        },
        {
          id: 'male-genitals',
          name: 'Male Internal Genital Organs',
          description: 'Prostate, seminal vesicles, vas deferens'
        },
        {
          id: 'female-genitals',
          name: 'Female Internal Genital Organs',
          description: 'Uterus, tubes, ovaries, vagina'
        },
        {
          id: 'perineum-subdivisions',
          name: 'Perineum and its Subdivisions',
          description: 'Urogenital and anal triangles'
        },
        {
          id: 'urogenital-triangle',
          name: 'Urogenital Triangle',
          description: 'Anterior perineal anatomy'
        },
        {
          id: 'anal-triangle',
          name: 'Anal Triangle',
          description: 'Posterior perineal anatomy'
        },
        {
          id: 'pelvic-vessels-nerves',
          name: 'Blood Vessels and Nerves of the Pelvis',
          description: 'Pelvic circulation and innervation'
        },
        {
          id: 'pelvis-surface',
          name: 'Surface Anatomy of the Pelvis and Perineum',
          description: 'Clinical landmarks and examination'
        }
      ],
      lastUpdated: '2024-01-09'
    },
    {
      id: 6,
      name: 'Lower Limb',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Lower Limb - Overview

The lower limb is designed for weight-bearing, locomotion, and stability. Select a subtopic below to study specific lower limb anatomical structures in detail.`,
      accessTier: 'free',
      subtopics: [
        {
          id: 'lower-limb-bones',
          name: 'Bones of the Lower Limb',
          description: 'Hip bone, femur, tibia, fibula, foot bones'
        },
        {
          id: 'lower-limb-joints',
          name: 'Joints of the Lower Limb',
          description: 'Hip, knee, ankle, foot joints'
        },
        {
          id: 'gluteal-region',
          name: 'Gluteal Region',
          description: 'Gluteal muscles and sciatic nerve'
        },
        {
          id: 'thigh-compartments',
          name: 'Thigh (Anterior, Medial, and Posterior Compartments)',
          description: 'Thigh muscle compartments and femoral triangle'
        },
        {
          id: 'popliteal-fossa',
          name: 'Popliteal Fossa',
          description: 'Posterior knee anatomy'
        },
        {
          id: 'leg-compartments',
          name: 'Leg (Anterior, Lateral, and Posterior Compartments)',
          description: 'Lower leg muscle compartments'
        },
        {
          id: 'foot-anatomy',
          name: 'Foot (Dorsum and Sole)',
          description: 'Foot muscles, arches, and weight-bearing'
        },
        {
          id: 'lower-limb-vessels',
          name: 'Arteries, Veins, and Lymphatics',
          description: 'Lower limb circulation and drainage'
        },
        {
          id: 'lower-limb-innervation',
          name: 'Cutaneous Innervation',
          description: 'Skin sensation and nerve territories'
        },
        {
          id: 'lower-limb-surface',
          name: 'Surface Anatomy of the Lower Limb',
          description: 'Clinical landmarks and examination'
        }
      ],
      lastUpdated: '2024-01-08'
    },
    {
      id: 7,
      name: 'Neuroanatomy',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Neuroanatomy - Overview

The nervous system controls and coordinates body functions through complex neural networks. Select a subtopic below to study specific neuroanatomical structures in detail.`,
      accessTier: 'free',
      subtopics: [
        {
          id: 'nervous-system-organization',
          name: 'Organization of the Nervous System',
          description: 'Central, peripheral, autonomic, and somatic divisions'
        },
        {
          id: 'meninges-csf',
          name: 'Meninges and Cerebrospinal Fluid',
          description: 'Brain coverings and CSF circulation'
        },
        {
          id: 'spinal-cord',
          name: 'Spinal Cord (Gross Anatomy, Tracts, Blood Supply)',
          description: 'Spinal cord structure, pathways, and vascularization'
        },
        {
          id: 'brainstem',
          name: 'Brainstem (Medulla, Pons, Midbrain)',
          description: 'Brainstem components and functions'
        },
        {
          id: 'cerebellum',
          name: 'Cerebellum',
          description: 'Balance, coordination, and motor learning'
        },
        {
          id: 'diencephalon',
          name: 'Diencephalon (Thalamus, Hypothalamus)',
          description: 'Thalamus, hypothalamus, and related structures'
        },
        {
          id: 'cerebral-hemispheres',
          name: 'Cerebral Hemispheres (Lobes, Functional Areas)',
          description: 'Cortical lobes and functional regions'
        },
        {
          id: 'basal-ganglia',
          name: 'Basal Ganglia',
          description: 'Motor control and movement disorders'
        },
        {
          id: 'limbic-system',
          name: 'Limbic System',
          description: 'Memory, emotion, and behavior circuits'
        },
        {
          id: 'cranial-nerves',
          name: 'Cranial Nerves',
          description: 'Twelve cranial nerves and their functions'
        },
        {
          id: 'autonomic-nervous-system',
          name: 'Autonomic Nervous System',
          description: 'Sympathetic and parasympathetic divisions'
        },
        {
          id: 'brain-ventricles',
          name: 'Ventricles of the Brain',
          description: 'CSF-filled spaces and circulation'
        },
        {
          id: 'arterial-supply',
          name: 'Arterial Supply (Circle of Willis)',
          description: 'Brain blood supply and vascular territories'
        },
        {
          id: 'venous-drainage',
          name: 'Venous Drainage (Dural Sinuses)',
          description: 'Brain venous system and dural sinuses'
        }
      ],
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

  // Handle subtopic view
  if (selectedSubtopic) {
    return (
      <div className="min-h-screen bg-docdot-bg">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => setSelectedSubtopic(null)}>
              <ArrowLeft className="mr-2" size={16} />
              Back to {selectedTopic?.name}
            </Button>
          </div>

          {/* Subtopic Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-docdot-heading">
                {selectedSubtopic.name}
              </CardTitle>
              {selectedSubtopic.description && (
                <p className="text-docdot-text">{selectedSubtopic.description}</p>
              )}
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              {selectedSubtopic.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedSubtopic.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold text-docdot-heading mb-2">
                    Content Coming Soon
                  </h3>
                  <p className="text-docdot-text">
                    This subtopic content is being developed. Check back soon for detailed notes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

          {/* Topic Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl text-docdot-heading">
                {selectedTopic.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: selectedTopic.content.replace(/\n/g, '<br/>') }} />
              </div>
            </CardContent>
          </Card>

          {/* Subtopics Grid */}
          {selectedTopic.subtopics && (
            <div>
              <h3 className="text-xl font-semibold text-docdot-heading mb-4">
                Study Topics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTopic.subtopics.map((subtopic) => (
                  <Card 
                    key={subtopic.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedSubtopic(subtopic)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-docdot-heading">
                        {subtopic.name}
                      </CardTitle>
                      {subtopic.description && (
                        <p className="text-sm text-docdot-text">
                          {subtopic.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="outline" size="sm" className="w-full">
                        Study This Topic
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Traditional Content Display for topics without subtopics */}
          {!selectedTopic.subtopics && (
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
          )}
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