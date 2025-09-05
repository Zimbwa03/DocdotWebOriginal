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
  Eye,
  Clock,
  Star,
  Users,
  Download
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
  const userTier = 'premium' as 'free' | 'starter' | 'premium';

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
- <strong>Frontal bone</strong>: Forms forehead and roof of orbits
- <strong>Parietal bones</strong>: Form sides and roof of skull  
- <strong>Temporal bones</strong>: House ear structures
- <strong>Occipital bone</strong>: Forms back of skull
- <strong>Sphenoid</strong>: Central skull base bone
- <strong>Ethmoid</strong>: Forms part of nasal cavity

## Foramina
- <strong>Foramen magnum</strong>: Spinal cord passage
- <strong>Optic canal</strong>: Optic nerve passage
- <strong>Superior orbital fissure</strong>: Multiple cranial nerves
- <strong>Foramen rotundum</strong>: Maxillary nerve
- <strong>Foramen ovale</strong>: Mandibular nerve

## Cranial Fossae  
- <strong>Anterior fossa</strong>: Frontal lobes
- <strong>Middle fossa</strong>: Temporal lobes
- <strong>Posterior fossa</strong>: Cerebellum and brainstem`
        },
        {
          id: 'scalp-face',
          name: 'Scalp and Face',
          description: 'Layers, muscles, vessels, and nerves',
          content: `# Scalp and Face

## Scalp Layers (SCALP)
- <strong>S</strong>: Skin
- <strong>C</strong>: Connective tissue (subcutaneous)
- <strong>A</strong>: Aponeurosis (galea aponeurotica)
- <strong>L</strong>: Loose connective tissue
- <strong>P</strong>: Pericranium

## Facial Muscles
- <strong>Muscles of expression</strong>: Controlled by facial nerve (CN VII)
- <strong>Muscles of mastication</strong>: Controlled by trigeminal nerve (CN V)
- <strong>Orbicularis oculi</strong>: Eye closure
- <strong>Orbicularis oris</strong>: Lip closure

## Blood Supply
- <strong>Facial artery</strong>: Main facial blood supply
- <strong>Superficial temporal artery</strong>: Temple region
- <strong>Maxillary artery</strong>: Deep facial structures`
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
# Upper Limb Anatomy Notes

## Introduction to the Upper Limb Bones

The upper limb is a marvel of evolutionary engineering, designed for mobility, dexterity, and interaction with the environment. It comprises a complex arrangement of bones, joints, muscles, nerves, and vessels, all working in concert to perform a vast array of functions, from powerful gripping to delicate manipulation. This section will focus on the skeletal framework of the upper limb, providing a foundational understanding of its individual bones and their collective contribution to the limb's overall function.

The upper limb is typically divided into four main regions: the shoulder girdle, the arm, the forearm, and the hand. Each region contains distinct bones that articulate to form various joints, allowing for a wide range of movements. Understanding the morphology and relationships of these bones is crucial for comprehending the biomechanics of the upper limb and for diagnosing and treating injuries and pathologies.

In these notes, we will explore each bone of the upper limb in detail, covering its key anatomical features, articulations with other bones, significant muscle attachments, and relevant clinical correlates. We will also incorporate mnemonics to aid in memorization and diagrams to provide visual clarity, drawing inspiration from the comprehensive and clinically oriented approach of Clinical Snell Anatomy, Kenhub, and Teach Me Anatomy.

### Overview of Upper Limb Bones

The upper limb consists of the following bones:

*   <strong>Shoulder Girdle:</strong> Clavicle and Scapula
*   <strong>Arm:</strong> Humerus
*   <strong>Forearm:</strong> Radius and Ulna
*   <strong>Hand:</strong> Carpals, Metacarpals, and Phalanges

Each of these bones plays a vital role in the structure and function of the upper limb, providing support, facilitating movement, and protecting underlying neurovascular structures. We will now delve into the specifics of each bone, starting with the shoulder girdle.

## The Clavicle (Collarbone)

The clavicle, commonly known as the collarbone, is a long, slender bone that forms the anterior part of the shoulder girdle. It is the only bony attachment between the upper limb and the axial skeleton, acting as a strut to keep the upper limb away from the trunk, allowing for maximum freedom of movement. Its S-shaped curvature provides resilience and increases the area for muscle attachment.

### Key Anatomical Features

The clavicle has two ends and a shaft:

*   <strong>Sternal End (Medial End):</strong> This end is rounded and articulates with the manubrium of the sternum to form the sternoclavicular joint. It is the only true articulation between the upper limb and the axial skeleton.
*   <strong>Acromial End (Lateral End):</strong> This end is flattened and articulates with the acromion of the scapula to form the acromioclavicular joint.
*   <strong>Shaft:</strong> The shaft of the clavicle is curved, with a convex anterior curvature medially and a concave anterior curvature laterally. The superior surface is smooth, while the inferior surface is rough due to ligamentous and muscular attachments.
    *   <strong>Conoid Tubercle:</strong> A prominent elevation on the inferior surface near the acromial end, serving as the attachment site for the conoid ligament (part of the coracoclavicular ligament).
    *   <strong>Trapezoid Line:</strong> A ridge extending laterally from the conoid tubercle, providing attachment for the trapezoid ligament (also part of the coracoclavicular ligament).
    *   <strong>Subclavian Groove:</strong> A groove on the inferior surface of the middle third of the shaft, providing attachment for the subclavius muscle.
    *   <strong>Impression for Costoclavicular Ligament:</strong> A rough, oval impression on the inferior surface of the sternal end, serving as the attachment site for the costoclavicular ligament.

### Articulations

The clavicle articulates with two bones:

1.  <strong>Sternum:</strong> At the sternal end, forming the <strong>sternoclavicular joint</strong> (a saddle-type synovial joint, functionally a ball-and-socket joint).
2.  <strong>Scapula:</strong> At the acromial end, forming the <strong>acromioclavicular joint</strong> (a plane-type synovial joint).

### Muscle Attachments

Several muscles attach to the clavicle, contributing to shoulder and neck movements:

*   <strong>Pectoralis Major:</strong> Attaches to the anterior surface of the medial half.
*   <strong>Sternocleidomastoid:</strong> Attaches to the superior surface of the medial end.
*   <strong>Deltoid:</strong> Attaches to the anterior surface of the lateral third.
*   <strong>Trapezius:</strong> Attaches to the posterior surface of the lateral third.
*   <strong>Subclavius:</strong> Attaches to the subclavian groove on the inferior surface.
*   <strong>Sternohyoid:</strong> Attaches to the posterior surface of the sternal end.

### Mnemonics

*   <strong>D</strong>on't <strong>T</strong>ouch <strong>S</strong>ome <strong>P</strong>eople's <strong>S</strong>tupid <strong>S</strong>houlders (<strong>D</strong>eltoid, <strong>T</strong>rapezius, <strong>S</strong>ubclavius, <strong>P</strong>ectoralis Major, <strong>S</strong>ternocleidomastoid, <strong>S</strong>ternohyoid).

### Clinical Correlates

*   <strong>Clavicle Fractures:</strong> The clavicle is one of the most commonly fractured bones, especially in children and athletes. The most common site of fracture is the middle third, due to its change in curvature and the lack of muscular support. Fractures often result from a fall on the outstretched hand or a direct blow to the shoulder. The sternocleidomastoid muscle pulls the medial fragment superiorly, while the weight of the arm and the pectoralis major muscle pull the lateral fragment inferiorly and medially, leading to characteristic displacement.
*   <strong>Ossification:</strong> The clavicle is unique as it is the first bone to ossify (around the 5th or 6th week of embryonic development) and the last to complete ossification (around 25 years of age). It undergoes intramembranous ossification, unlike most other long bones which undergo endochondral ossification.
*   <strong>Cleidocranial Dysostosis:</strong> A rare congenital disorder characterized by defective ossification of the clavicles (often absent or hypoplastic), along with other skeletal abnormalities. Individuals with this condition may be able to approximate their shoulders anteriorly due to the absence of the clavicular strut.

## The Scapula (Shoulder Blade)

The scapula, or shoulder blade, is a large, flat, triangular bone that lies on the posterior aspect of the thorax, typically spanning from the second to the seventh ribs. It is a key component of the shoulder girdle, providing attachment for numerous muscles and forming the socket for the humerus at the glenohumeral joint. Its mobility on the thoracic wall is crucial for the extensive range of motion of the upper limb.

### Key Anatomical Features

The scapula has two surfaces, three borders, three angles, and several prominent processes:

#### Surfaces:

*   <strong>Costal (Anterior) Surface:</strong> This surface faces the ribs and is concave, forming the <strong>subscapular fossa</strong>, which is occupied by the subscapularis muscle.
*   <strong>Posterior Surface:</strong> This surface is convex and is divided by the spine of the scapula into two fossae:
    *   <strong>Supraspinous Fossa:</strong> Superior to the spine, occupied by the supraspinatus muscle.
    *   <strong>Infraspinous Fossa:</strong> Inferior to the spine, occupied by the infraspinatus muscle.

#### Borders:

*   <strong>Superior Border:</strong> The shortest and sharpest border, featuring the <strong>suprascapular notch</strong> (or scapular notch), which is bridged by the superior transverse scapular ligament, forming a foramen for the suprascapular nerve.
*   <strong>Medial (Vertebral) Border:</strong> The longest border, running parallel to the vertebral column.
*   <strong>Lateral (Axillary) Border:</strong> The thickest border, extending from the glenoid cavity inferiorly.

#### Angles:

*   <strong>Superior Angle:</strong> Formed by the junction of the superior and medial borders.
*   <strong>Inferior Angle:</strong> Formed by the junction of the medial and lateral borders; serves as a landmark for counting ribs (usually at the level of T7).
*   <strong>Lateral Angle:</strong> The thickest part of the scapula, featuring the glenoid cavity.

#### Processes:

*   <strong>Spine of the Scapula:</strong> A prominent ridge on the posterior surface that extends laterally to form the acromion. It divides the posterior surface into the supraspinous and infraspinous fossae.
*   <strong>Acromion:</strong> The flattened, most lateral part of the spine, forming the highest point of the shoulder. It articulates with the clavicle at the acromioclavicular joint.
*   <strong>Coracoid Process:</strong> A beak-like projection from the superior border of the scapula, anterior to the glenoid cavity. It serves as an attachment site for several muscles and ligaments.

*   <strong>Glenoid Cavity (Fossa):</strong> A shallow, pear-shaped articular depression on the lateral angle of the scapula, articulating with the head of the humerus to form the glenohumeral (shoulder) joint. It is deepened slightly by the <strong>glenoid labrum</strong>, a fibrocartilaginous rim.
*   <strong>Supraglenoid Tubercle:</strong> A small projection superior to the glenoid cavity, serving as the origin for the long head of the biceps brachii muscle.
*   <strong>Infraglenoid Tubercle:</strong> A small projection inferior to the glenoid cavity, serving as the origin for the long head of the triceps brachii muscle.

### Articulations

The scapula articulates with two bones:

1.  <strong>Humerus:</strong> At the glenoid cavity, forming the <strong>glenohumeral joint</strong> (a ball-and-socket synovial joint, allowing for extensive movement).
2.  <strong>Clavicle:</strong> At the acromion, forming the <strong>acromioclavicular joint</strong> (a plane-type synovial joint).

### Muscle Attachments

Numerous muscles attach to the scapula, contributing to movements of the shoulder girdle and the humerus. Key muscles include:

*   <strong>Subscapularis:</strong> Originates from the subscapular fossa.
*   <strong>Supraspinatus:</strong> Originates from the supraspinous fossa.
*   <strong>Infraspinatus:</strong> Originates from the infraspinous fossa.
*   <strong>Teres Minor:</strong> Originates from the upper two-thirds of the lateral border.
*   <strong>Teres Major:</strong> Originates from the lower third of the lateral border and inferior angle.
*   <strong>Deltoid:</strong> Inserts onto the spine and acromion.
*   <strong>Trapezius:</strong> Inserts onto the spine and acromion.
*   <strong>Rhomboid Major:</strong> Inserts onto the medial border below the spine.
*   <strong>Rhomboid Minor:</strong> Inserts onto the medial border at the root of the spine.
*   <strong>Levator Scapulae:</strong> Inserts onto the superior angle.
*   <strong>Serratus Anterior:</strong> Inserts onto the medial border (costal surface).
*   <strong>Biceps Brachii (long head):</strong> Originates from the supraglenoid tubercle.
*   <strong>Triceps Brachii (long head):</strong> Originates from the infraglenoid tubercle.
*   <strong>Coracobrachialis:</strong> Originates from the coracoid process.
*   <strong>Pectoralis Minor:</strong> Inserts onto the coracoid process.
*   <strong>Short head of Biceps Brachii:</strong> Originates from the coracoid process.

### Mnemonics

*   <strong>SITS</strong> muscles (Rotator Cuff): <strong>S</strong>upraspinatus, <strong>I</strong>nfraspinatus, <strong>T</strong>eres Minor, <strong>S</strong>ubscapularis. These muscles originate from the scapula and insert onto the humerus, stabilizing the glenohumeral joint.

### Clinical Correlates

*   <strong>Scapular Fractures:</strong> Less common than clavicle fractures due to the scapula's protected position by surrounding muscles and the thoracic cage. They usually result from severe direct trauma. Fractures of the body are most common, but fractures involving the glenoid cavity can significantly impact shoulder joint function.
*   <strong>Winged Scapula:</strong> This condition occurs when the medial border of the scapula protrudes posteriorly, giving the appearance of a wing. It is most commonly caused by paralysis of the serratus anterior muscle due to damage to the long thoracic nerve. This impairs the scapula's ability to protract and rotate, affecting overhead arm movements.
*   <strong>Shoulder Dislocation:</strong> While not a scapular fracture, the glenoid cavity of the scapula is directly involved in shoulder dislocations. The shallow nature of the glenoid cavity, combined with the large head of the humerus, makes the glenohumeral joint the most frequently dislocated joint in the body. Most dislocations are anterior-inferior.
*   <strong>Calcific Tendinitis:</strong> Often affects the supraspinatus tendon, which passes through the subacromial space, superior to the supraspinous fossa of the scapula. Calcium deposits can form in the tendon, leading to pain and restricted movement, particularly during abduction of the arm.

## The Humerus (Arm Bone)

The humerus is the longest and largest bone of the upper limb, extending from the shoulder to the elbow. It articulates with the scapula proximally to form the glenohumeral (shoulder) joint and with the radius and ulna distally to form the elbow joint. Its robust structure and numerous muscle attachments make it crucial for movements of the arm and forearm.

### Key Anatomical Features

The humerus is a typical long bone, consisting of a proximal end, a shaft, and a distal end.

#### Proximal End:

*   <strong>Head:</strong> A large, smooth, rounded articular surface that articulates with the glenoid cavity of the scapula. It faces medially, superiorly, and posteriorly.
*   <strong>Anatomical Neck:</strong> A slight constriction inferior to the head, marking the attachment of the joint capsule.
*   <strong>Surgical Neck:</strong> A common site of fracture, located inferior to the greater and lesser tubercles.
*   <strong>Greater Tubercle:</strong> A large, lateral projection with three facets for the insertion of the supraspinatus, infraspinatus, and teres minor muscles (SIT muscles of the rotator cuff).
*   <strong>Lesser Tubercle:</strong> A smaller, anterior projection for the insertion of the subscapularis muscle.
*   <strong>Intertubercular (Bicipital) Groove:</strong> A deep groove between the greater and lesser tubercles, transmitting the long head tendon of the biceps brachii muscle.

#### Shaft:

*   <strong>Deltoid Tuberosity:</strong> A V-shaped roughened area on the lateral aspect of the shaft, serving as the insertion site for the deltoid muscle.
*   <strong>Radial (Spiral) Groove:</strong> An oblique groove on the posterior surface of the shaft, running inferiorly and laterally. It transmits the radial nerve and deep brachial artery.
*   <strong>Nutrient Foramen:</strong> Located on the anteromedial surface, directed distally.

#### Distal End:

*   <strong>Capitulum:</strong> A rounded, lateral articular eminence that articulates with the head of the radius.
*   <strong>Trochlea:</strong> A spool-shaped medial articular surface that articulates with the trochlear notch of the ulna.
*   <strong>Medial Epicondyle:</strong> A prominent projection on the medial side, providing attachment for the common flexor origin of the forearm muscles and the ulnar collateral ligament. The ulnar nerve passes posterior to it.
*   <strong>Lateral Epicondyle:</strong> A smaller projection on the lateral side, providing attachment for the common extensor origin of the forearm muscles and the radial collateral ligament.
*   <strong>Coronoid Fossa:</strong> An anterior depression superior to the trochlea, accommodating the coronoid process of the ulna during full flexion of the elbow.
*   <strong>Radial Fossa:</strong> An anterior depression superior to the capitulum, accommodating the head of the radius during full flexion of the elbow.
*   <strong>Olecranon Fossa:</strong> A large posterior depression superior to the trochlea, accommodating the olecranon process of the ulna during full extension of the elbow.

### Articulations

The humerus articulates with three bones:

1.  <strong>Scapula:</strong> At the head of the humerus and the glenoid cavity, forming the <strong>glenohumeral joint</strong>.
2.  <strong>Radius:</strong> At the capitulum and the head of the radius, forming part of the <strong>elbow joint</strong> (humeroradial joint).
3.  <strong>Ulna:</strong> At the trochlea and the trochlear notch, forming part of the <strong>elbow joint</strong> (humeroulnar joint).

### Muscle Attachments

Numerous muscles attach to the humerus, facilitating a wide range of movements:

*   <strong>Rotator Cuff Muscles (SITS):</strong> Supraspinatus, Infraspinatus, Teres Minor (insert on Greater Tubercle), Subscapularis (inserts on Lesser Tubercle).
*   <strong>Deltoid:</strong> Inserts on the deltoid tuberosity.
*   <strong>Pectoralis Major:</strong> Inserts on the lateral lip of the intertubercular groove.
*   <strong>Latissimus Dorsi:</strong> Inserts on the floor of the intertubercular groove.
*   <strong>Teres Major:</strong> Inserts on the medial lip of the intertubercular groove.
*   <strong>Coracobrachialis:</strong> Inserts on the medial surface of the mid-shaft.
*   <strong>Biceps Brachii:</strong> Long head tendon runs in the intertubercular groove; short head attaches to coracoid process of scapula.
*   <strong>Brachialis:</strong> Originates from the anterior surface of the distal half of the humerus.
*   <strong>Triceps Brachii:</strong> Long head originates from infraglenoid tubercle of scapula; medial and lateral heads originate from posterior surface of humerus.
*   <strong>Forearm Flexors:</strong> Originate from the medial epicondyle.
*   <strong>Forearm Extensors:</strong> Originate from the lateral epicondyle.

### Mnemonics

*   <strong>'A' for Anterior, 'P' for Posterior:</strong> The <strong>A</strong>natomical neck is <strong>A</strong>nterior to the surgical neck. The <strong>P</strong>osterior surface has the radial groove.
*   <strong>'SIT' on the Greater Tubercle:</strong> <strong>S</strong>upraspinatus, <strong>I</strong>nfraspinatus, <strong>T</strong>eres Minor insert on the <strong>Greater Tubercle</strong>.
*   <strong>'Lady Between Two Majors':</strong> <strong>L</strong>atissimus Dorsi inserts on the <strong>L</strong>ip of the intertubercular groove, <strong>between</strong> Pectoralis <strong>Major</strong> (lateral lip) and Teres <strong>Major</strong> (medial lip).

### Clinical Correlates

*   <strong>Fractures of the Humerus:</strong> Common due to direct trauma or falls. Different regions of the humerus are associated with injury to specific nerves:
    *   <strong>Surgical Neck Fracture:</strong> Often injures the <strong>axillary nerve</strong> and posterior circumflex humeral artery, leading to deltoid paralysis and loss of sensation over the lateral shoulder.
    *   <strong>Mid-shaft Fracture (Spiral Groove):</strong> Often injures the <strong>radial nerve</strong>, leading to wrist drop (inability to extend wrist and fingers) and loss of sensation over the posterior forearm and dorsum of the hand.
    *   <strong>Supracondylar Fracture:</strong> A common fracture in children, occurring just above the epicondyles. Can injure the <strong>median nerve</strong> and <strong>brachial artery</strong>, potentially leading to Volkmann's ischemic contracture (a permanent flexion deformity of the hand and wrist).
    *   <strong>Medial Epicondyle Fracture:</strong> Can injure the <strong>ulnar nerve</strong>, leading to claw hand deformity and sensory loss over the medial hand.
*   <strong>Shoulder Dislocation:</strong> The glenohumeral joint is the most commonly dislocated joint. The head of the humerus typically dislocates anteriorly and inferiorly, often tearing the joint capsule and potentially damaging the axillary nerve.
*   <strong>Rotator Cuff Injuries:</strong> Tears or inflammation of the rotator cuff muscles (SITS) are common, especially in athletes and older individuals. These injuries lead to pain and weakness, particularly during abduction and rotation of the arm.

## The Radius (Lateral Forearm Bone)

The radius is the lateral bone of the forearm, extending from the elbow to the wrist. It is the shorter of the two forearm bones and plays a crucial role in pronation and supination of the forearm, as well as articulation with the carpal bones at the wrist. Its name, 'radius,' comes from its resemblance to a wheel's spoke, reflecting its rotational movement.

### Key Anatomical Features

The radius, like other long bones, has a proximal end, a shaft, and a distal end.

#### Proximal End:

*   <strong>Head:</strong> A cylindrical, disc-shaped structure that articulates with the capitulum of the humerus and the radial notch of the ulna. The superior surface is concave.
*   <strong>Neck:</strong> A constricted part inferior to the head.
*   <strong>Radial Tuberosity:</strong> A roughened projection inferior to the neck, serving as the insertion site for the biceps brachii muscle.

#### Shaft:

*   <strong>Interosseous Border:</strong> A sharp medial border that provides attachment for the interosseous membrane, which connects the radius and ulna.
*   <strong>Anterior Surface:</strong> Smooth, with a nutrient foramen directed proximally.
*   <strong>Posterior Surface:</strong> Smooth.
*   <strong>Lateral Surface:</strong> Roughened in its middle part for the insertion of the pronator teres muscle.

#### Distal End:

*   <strong>Styloid Process:</strong> A pointed projection on the lateral side, extending distally. It is palpable at the wrist.
*   <strong>Ulnar Notch:</strong> A concavity on the medial side that articulates with the head of the ulna.
*   <strong>Dorsal Tubercle (Lister's Tubercle):</strong> A small, palpable tubercle on the posterior surface, lateral to the groove for the extensor pollicis longus tendon.
*   <strong>Articular Surface:</strong> The distal end is concave and articulates with the scaphoid and lunate carpal bones.

### Articulations

The radius articulates with four bones:

1.  <strong>Humerus:</strong> At the head of the radius and the capitulum, forming the <strong>humeroradial joint</strong> (part of the elbow joint).
2.  <strong>Ulna:</strong>
    *   <strong>Proximally:</strong> At the head of the radius and the radial notch of the ulna, forming the <strong>proximal radioulnar joint</strong> (a pivot-type synovial joint).
    *   <strong>Distally:</strong> At the ulnar notch of the radius and the head of the ulna, forming the <strong>distal radioulnar joint</strong> (a pivot-type synovial joint).
3.  <strong>Scaphoid:</strong> At the distal articular surface.
4.  <strong>Lunate:</strong> At the distal articular surface.

### Muscle Attachments

Key muscles attaching to the radius include:

*   <strong>Biceps Brachii:</strong> Inserts on the radial tuberosity.
*   <strong>Supinator:</strong> Inserts on the proximal part of the shaft.
*   <strong>Pronator Teres:</strong> Inserts on the lateral surface of the shaft.
*   <strong>Flexor Digitorum Superficialis:</strong> Originates from the anterior surface of the shaft.
*   <strong>Flexor Pollicis Longus:</strong> Originates from the anterior surface of the shaft.
*   <strong>Pronator Quadratus:</strong> Inserts on the anterior surface of the distal end.
*   <strong>Abductor Pollicis Longus:</strong> Originates from the posterior surface of the shaft.
*   <strong>Extensor Pollicis Brevis:</strong> Originates from the posterior surface of the shaft.

### Mnemonics

*   <strong>R</strong>adius is <strong>L</strong>ateral: The <strong>R</strong>adius is on the <strong>L</strong>ateral (thumb) side of the forearm.
*   <strong>S</strong>o <strong>L</strong>ong <strong>T</strong>o <strong>P</strong>inky, <strong>H</strong>ere <strong>C</strong>omes <strong>T</strong>he <strong>T</strong>humb: <strong>S</strong>caphoid, <strong>L</strong>unate, <strong>T</strong>riquetrum, <strong>P</strong>isiform, <strong>H</strong>amate, <strong>C</strong>apitate, <strong>T</strong>rapezoid, <strong>T</strong>rapezium. The radius articulates with the <strong>S</strong>caphoid and <strong>L</strong>unate.

### Clinical Correlates

*   <strong>Colles' Fracture:</strong> A very common fracture of the distal radius, typically occurring from a fall on an outstretched hand (FOOSH). The distal fragment is displaced dorsally, resulting in a characteristic "dinner fork" deformity. It can also involve fracture of the ulnar styloid process.
*   <strong>Smith's Fracture:</strong> A fracture of the distal radius with volar (anterior) displacement of the distal fragment, often caused by a fall on the back of the hand. It is sometimes called a "reverse Colles' fracture."
*   <strong>Galeazzi Fracture:</strong> A fracture of the distal third of the radius with dislocation of the distal radioulnar joint. It is important to recognize and treat both the fracture and the dislocation.
*   <strong>Pulled Elbow (Nursemaid's Elbow):</strong> A common injury in young children, where the head of the radius is subluxated (partially dislocated) from the annular ligament. It typically occurs when a child's arm is suddenly pulled or jerked. The child presents with pain and refusal to use the arm.

## The Ulna (Medial Forearm Bone)

The ulna is the medial bone of the forearm, extending from the elbow to the wrist. It is longer than the radius and is the primary bone involved in forming the elbow joint with the humerus. While it contributes to the wrist joint, its articulation with the carpal bones is indirect, via an articular disc. The ulna is crucial for the stability of the elbow and for providing a stable axis for the radius to rotate around during pronation and supination.

### Key Anatomical Features

The ulna has a proximal end, a shaft, and a distal end.

#### Proximal End:

*   <strong>Olecranon Process:</strong> A large, prominent projection that forms the most proximal part of the ulna and the posterior point of the elbow. It articulates with the olecranon fossa of the humerus during elbow extension.
*   <strong>Coronoid Process:</strong> A triangular projection on the anterior aspect of the proximal ulna, inferior to the trochlear notch. It articulates with the coronoid fossa of the humerus during elbow flexion.
*   <strong>Trochlear Notch:</strong> A large, C-shaped articular surface between the olecranon and coronoid processes, articulating with the trochlea of the humerus.
*   <strong>Radial Notch:</strong> A small, oval articular facet on the lateral side of the coronoid process, articulating with the head of the radius.
*   <strong>Ulnar Tuberosity:</strong> A roughened area inferior to the coronoid process, serving as the insertion site for the brachialis muscle.

#### Shaft:

*   <strong>Interosseous Border:</strong> A sharp lateral border that provides attachment for the interosseous membrane, connecting the ulna and radius.
*   <strong>Anterior Surface:</strong> Smooth, with a nutrient foramen directed proximally.
*   <strong>Posterior Surface:</strong> Marked by several ridges for muscle attachments.

#### Distal End:

*   <strong>Head:</strong> A small, rounded articular surface that articulates with the ulnar notch of the radius and the articular disc of the wrist joint. It is located medially and posteriorly to the wrist.
*   <strong>Styloid Process:</strong> A pointed projection on the posteromedial aspect of the head, extending distally. It is palpable on the medial side of the wrist.

### Articulations

The ulna articulates with two bones:

1.  <strong>Humerus:</strong> At the trochlear notch and the trochlea, forming the <strong>humeroulnar joint</strong> (part of the elbow joint).
2.  <strong>Radius:</strong>
    *   <strong>Proximally:</strong> At the radial notch of the ulna and the proximal radioulnnar joint**.
    *   <strong>Distally:</strong> At the head of the ulna and the ulnar notch of the radius, forming the <strong>distal radioulnar joint</strong>.

### Muscle Attachments

Key muscles attaching to the ulna include:

*   <strong>Brachialis:</strong> Inserts on the ulnar tuberosity and coronoid process.
*   <strong>Triceps Brachii:</strong> Inserts on the olecranon process.
*   <strong>Anconeus:</strong> Inserts on the lateral surface of the olecranon and posterior surface of the ulna.
*   <strong>Pronator Quadratus:</strong> Originates from the anterior surface of the distal ulna.
*   <strong>Flexor Digitorum Profundus:</strong> Originates from the anterior and medial surfaces of the shaft.
*   <strong>Flexor Carpi Ulnaris:</strong> Originates from the olecranon and posterior border of the ulna.
*   <strong>Supinator:</strong> Originates from the lateral epicondyle of the humerus and supinator crest of the ulna.
*   <strong>Extensor Carpi Ulnaris:</strong> Originates from the lateral epicondyle of the humerus and posterior border of the ulna.
*   <strong>Abductor Pollicis Longus:</strong> Originates from the posterior surface of the ulna.
*   <strong>Extensor Pollicis Longus:</strong> Originates from the posterior surface of the ulna.
*   <strong>Extensor Indicis:</strong> Originates from the posterior surface of the ulna.

### Mnemonics

*   <strong>U</strong>lna is <strong>M</strong>edial: The <strong>U</strong>lna is on the <strong>M</strong>edial (pinky finger) side of the forearm.
*   <strong>O</strong>ut <strong>C</strong>omes <strong>T</strong>he <strong>R</strong>adius: <strong>O</strong>lecranon, <strong>C</strong>oronoid, <strong>T</strong>rochlear notch, <strong>R</strong>adial notch (features of the proximal ulna).

### Clinical Correlates

*   <strong>Monteggia Fracture:</strong> A fracture of the proximal ulna with dislocation of the radial head. It typically results from a direct blow to the posterior forearm or a fall on an outstretched hand with forced pronation.
*   <strong>Nightstick Fracture:</strong> An isolated fracture of the ulnar shaft, often resulting from a direct blow to the forearm (e.g., in self-defense).
*   <strong>Olecranon Fracture:</strong> A common fracture, often caused by a direct fall on the elbow or a sudden, forceful contraction of the triceps brachii muscle. It can lead to significant impairment of elbow extension.
*   <strong>Ulnar Nerve Entrapment (Cubital Tunnel Syndrome):</strong> The ulnar nerve passes posterior to the medial epicondyle of the humerus and then enters the cubital tunnel, formed by the olecranon and medial epicondyle. Compression or irritation of the ulnar nerve in this region can lead to numbness and tingling in the little finger and medial half of the ring finger, as well as weakness of intrinsic hand muscles.

## The Carpal Bones (Wrist Bones)

The carpal bones are a group of eight small, irregularly shaped bones that form the wrist (carpus). They are arranged in two rows: a proximal row and a distal row. These bones provide flexibility to the wrist and allow for a wide range of movements, while also providing a stable base for the hand.

### Key Anatomical Features and Arrangement

#### Proximal Row (from lateral to medial):

1.  <strong>Scaphoid:</strong> Boat-shaped bone, the largest bone in the proximal row. It articulates with the radius proximally and is a common site for fracture due to falls on an outstretched hand.
2.  <strong>Lunate:</strong> Moon-shaped bone, articulating with the radius proximally. It is the most frequently dislocated carpal bone.
3.  <strong>Triquetrum:</strong> Pyramid-shaped bone, located medial to the lunate. It articulates with the articular disc of the distal radioulnar joint.
4.  <strong>Pisiform:</strong> Pea-shaped bone, located anterior to the triquetrum. It is a sesamoid bone, meaning it is embedded within the flexor carpi ulnaris tendon.

#### Distal Row (from lateral to medial):

1.  <strong>Trapezium:</strong> Four-sided bone, articulating with the first metacarpal (thumb) and forming the highly mobile carpometacarpal joint of the thumb.
2.  <strong>Trapezoid:</strong> Wedge-shaped bone, articulating with the second metacarpal.
3.  <strong>Capitate:</strong> Head-shaped bone, the largest carpal bone, located in the center of the wrist. It articulates with the third metacarpal.
4.  <strong>Hamate:</strong> Hooked bone, characterized by a prominent hook-like process (hook of hamate) on its palmar surface. It articulates with the fourth and fifth metacarpals.

### Articulations

The carpal bones articulate with each other (intercarpal joints), with the radius (radiocarpal joint), and with the metacarpals (carpometacarpal joints).

### Mnemonics

To remember the carpal bones from lateral to medial, proximal row first, then distal row:

*   <strong>S</strong>ome <strong>L</strong>overs <strong>T</strong>ry <strong>P</strong>ositions <strong>T</strong>hat <strong>T</strong>hey <strong>C</strong>an't <strong>H</strong>andle:
    *   <strong>S</strong>caphoid
    *   <strong>L</strong>unate
    *   <strong>T</strong>riquetrum
    *   <strong>P</strong>isiform
    *   <strong>T</strong>rapezium
    *   <strong>T</strong>rapezoid
    *   <strong>C</strong>apitate
    *   <strong>H</strong>amate

### Clinical Correlates

*   <strong>Scaphoid Fracture:</strong> The most common carpal bone fracture, often resulting from a fall on an outstretched hand. Due to its precarious blood supply (entering distally), scaphoid fractures are prone to <strong>avascular necrosis</strong> (death of bone tissue due to lack of blood supply) and <strong>non-union</strong> (failure to heal), which can lead to chronic wrist pain and arthritis.
*   <strong>Carpal Tunnel Syndrome:</strong> A common condition caused by compression of the median nerve as it passes through the carpal tunnel, a narrow passageway in the wrist formed by the carpal bones and the flexor retinaculum. Symptoms include numbness, tingling, and weakness in the thumb, index, middle, and radial half of the ring finger.
*   <strong>Dislocation of the Lunate:</strong> The lunate is the most frequently dislocated carpal bone, usually dislocating anteriorly (volarly). This can compress the median nerve within the carpal tunnel and compromise blood supply to the lunate, potentially leading to avascular necrosis.
*   <strong>Fracture of the Hook of Hamate:</strong> Often occurs in sports involving gripping (e.g., golf, baseball, tennis) due to direct trauma. Can injure the ulnar nerve and ulnar artery, leading to weakness of intrinsic hand muscles and sensory deficits in the medial hand.

## The Metacarpal Bones (Palm Bones)

The metacarpal bones are five long bones that form the palm of the hand. They are numbered I to V, starting from the thumb (lateral side) to the little finger (medial side). Each metacarpal bone consists of a base (proximally), a shaft, and a head (distally). They provide the structural framework for the palm and articulate with the carpal bones proximally and the phalanges distally.

### Key Anatomical Features

*   <strong>Base:</strong> The proximal end, which articulates with the carpal bones.
*   <strong>Shaft:</strong> The body of the metacarpal, which is triangular in cross-section proximally and cylindrical distally.
*   <strong>Head:</strong> The distal end, which is rounded and articulates with the proximal phalanges to form the metacarpophalangeal (MCP) joints.

#### Specific Features:

*   <strong>First Metacarpal (Thumb):</strong> Shorter and stouter than the others, it articulates with the trapezium to form a saddle-shaped carpometacarpal (CMC) joint, allowing for a wide range of thumb movements, including opposition.
*   <strong>Second Metacarpal:</strong> The longest metacarpal, articulating with the trapezoid, capitate, and third metacarpal.
*   <strong>Third Metacarpal:</strong> Characterized by a styloid process on its dorsal aspect of the base, articulating with the capitate.
*   <strong>Fourth Metacarpal:</strong> Articulates with the hamate and third and fifth metacarpals.
*   <strong>Fifth Metacarpal:</strong> Articulates with the hamate and fourth metacarpal.

### Articulations

*   <strong>Carpometacarpal (CMC) Joints:</strong> Articulations between the bases of the metacarpals and the distal row of carpal bones. The first CMC joint (thumb) is a saddle joint, while the others are plane synovial joints, allowing for limited gliding movements.
*   <strong>Metacarpophalangeal (MCP) Joints:</strong> Articulations between the heads of the metacarpals and the bases of the proximal phalanges. These are condyloid synovial joints, allowing for flexion, extension, abduction, adduction, and circumduction.

### Muscle Attachments

Numerous intrinsic hand muscles and some extrinsic forearm muscles attach to the metacarpals, contributing to hand movements. Examples include:

*   <strong>Interossei Muscles:</strong> Originate from the metacarpal shafts.
*   <strong>Adductor Pollicis:</strong> Originates from the second and third metacarpals.
*   <strong>Opponens Pollicis:</strong> Inserts on the first metacarpal.
*   <strong>Opponens Digiti Minimi:</strong> Inserts on the fifth metacarpal.

### Mnemonics

*   The metacarpals are simply numbered I-V from thumb to pinky.

### Clinical Correlates

*   <strong>Boxer's Fracture:</strong> A common fracture of the neck of the fifth metacarpal (sometimes the fourth), typically resulting from punching an object with a closed fist. The distal fragment is usually displaced volarly, leading to a characteristic deformity.
*   <strong>Bennett's Fracture:</strong> An intra-articular fracture-dislocation of the base of the first metacarpal, involving the carpometacarpal joint of the thumb. It is caused by axial loading along the thumb and is often unstable due to muscle pull.
*   <strong>Rolando's Fracture:</strong> A comminuted intra-articular fracture at the base of the first metacarpal, similar to Bennett's but with multiple fragments. It is more complex and often harder to treat.
*   <strong>Metacarpal Fractures:</strong> Can occur from direct trauma or crushing injuries. The stability and treatment depend on the location and type of fracture.

## The Phalanges (Finger and Thumb Bones)

The phalanges are the bones that make up the digits (fingers and thumb) of the hand. Each finger (digits II-V) has three phalanges: a proximal, a middle, and a distal phalanx. The thumb (digit I) has only two phalanges: a proximal and a distal phalanx. These bones provide the framework for the fingers, allowing for fine motor movements and gripping.

### Key Anatomical Features

Each phalanx consists of a base (proximally), a shaft, and a head (distally).

*   <strong>Base:</strong> The proximal end, which articulates with the head of the metacarpal (for proximal phalanges) or the head of the more proximal phalanx (for middle and distal phalanges).
*   <strong>Shaft:</strong> The body of the phalanx.
*   <strong>Head:</strong> The distal end, which articulates with the base of the more distal phalanx (for proximal and middle phalanges) or forms the tip of the finger (for distal phalanges).

#### Specific Features:

*   <strong>Proximal Phalanges:</strong> The longest of the three phalanges in each finger. Their bases articulate with the metacarpal heads, and their heads articulate with the middle phalanges.
*   <strong>Middle Phalanges:</strong> Located between the proximal and distal phalanges in fingers II-V. The thumb lacks a middle phalanx.
*   <strong>Distal Phalanges:</strong> The shortest phalanges, forming the tips of the fingers and thumb. They are characterized by a roughened, flattened distal end that supports the nail bed.

### Articulations

*   <strong>Metacarpophalangeal (MCP) Joints:</strong> Articulations between the heads of the metacarpals and the bases of the proximal phalanges. These are condyloid synovial joints.
*   <strong>Proximal Interphalangeal (PIP) Joints:</strong> Articulations between the heads of the proximal phalanges and the bases of the middle phalanges. These are hinge synovial joints, allowing for flexion and extension.
*   <strong>Distal Interphalangeal (DIP) Joints:</strong> Articulations between the heads of the middle phalanges and the bases of the distal phalanges (in fingers II-V). These are also hinge synovial joints, allowing for flexion and extension.
*   <strong>Interphalangeal (IP) Joint of the Thumb:</strong> The single joint between the proximal and distal phalanges of the thumb. This is a hinge synovial joint.

### Muscle Attachments

Various intrinsic hand muscles and extrinsic forearm muscles attach to the phalanges, enabling finger movements. Examples include:

*   <strong>Flexor Digitorum Superficialis:</strong> Inserts on the middle phalanges.
*   <strong>Flexor Digitorum Profundus:</strong> Inserts on the distal phalanges.
*   <strong>Extensor Digitorum:</strong> Inserts on the middle and distal phalanges via the extensor expansion.
*   <strong>Interossei and Lumbricals:</strong> Insert on the bases of the proximal phalanges and contribute to the extensor expansion.

### Mnemonics

*   <strong>P</strong>roximal, <strong>M</strong>iddle, <strong>D</strong>istal: The order of phalanges from the palm outwards.
*   <strong>Thumb has Two, Fingers have Three:</strong> A simple way to remember the number of phalanges per digit.

### Clinical Correlates

*   <strong>Phalangeal Fractures:</strong> Very common, often resulting from crushing injuries, direct blows, or sports-related trauma. They can range from simple stable fractures to complex comminuted fractures. Proper reduction and immobilization are crucial to prevent deformity and preserve function.
*   <strong>Mallet Finger:</strong> An injury to the extensor tendon at the DIP joint, causing the distal phalanx to remain in a flexed position. It typically occurs when a force suddenly flexes the extended fingertip (e.g., a baseball hitting the tip of the finger).
*   <strong>Boutonnière Deformity:</strong> A deformity of the finger characterized by flexion of the PIP joint and hyperextension of the DIP joint. It results from damage to the central slip of the extensor tendon at the PIP joint.
*   <strong>Swan Neck Deformity:</strong> A deformity of the finger characterized by hyperextension of the PIP joint and flexion of the DIP joint. It is often associated with rheumatoid arthritis or other conditions affecting the tendons and ligaments of the hand.
*   <strong>Trigger Finger (Stenosing Tenosynovitis):</strong> A condition where a finger gets stuck in a bent position and then straightens with a snap, like a trigger being pulled. It is caused by inflammation and thickening of the tendon sheath, which restricts the smooth gliding of the flexor tendon.

## Conclusion

The bones of the upper limb form a sophisticated and adaptable skeletal framework, enabling the diverse range of movements and functions characteristic of the human arm and hand. From the stabilizing role of the clavicle and scapula in the shoulder girdle to the intricate articulations of the carpal and phalangeal bones in the hand, each component is meticulously designed to contribute to both mobility and stability.

A thorough understanding of the anatomy of these bones, their articulations, muscle attachments, and common clinical correlates is fundamental for anyone in the medical field. This knowledge is not only essential for accurate diagnosis and effective treatment of musculoskeletal injuries and conditions but also for appreciating the remarkable complexity and functional elegance of the human body.

By combining detailed anatomical descriptions with practical mnemonics and relevant clinical insights, these notes aim to provide a comprehensive and accessible resource for learning and reviewing the osteology of the upper limb, preparing you for both academic success and clinical practice.

## References

1.  Kenhub. (n.d.). *Tibia: Anatomy and clinical notes*. Retrieved from [https://www.kenhub.com/en/library/anatomy/tibia](https://www.kenhub.com/en/library/anatomy/tibia)
2.  TeachMeAnatomy. (n.d.). *Human Upper Limb Anatomy*. Retrieved from [https://teachmeanatomy.info/upper-limb/](https://teachmeanatomy.info/upper-limb/)
3.  Snell, R. S. (2012). *Clinical Anatomy by Regions* (9th ed.). Lippincott Williams & Wilkins. (General reference for anatomical details and clinical correlates)
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
          description: 'Upper arm muscle compartments',
          content: `# Upper Limb Anatomy: Arm (Anterior and Posterior Compartments)

## Overview

The arm, located between the shoulder and elbow joints, is divided into two main fascial compartments: the anterior (flexor) compartment and the posterior (extensor) compartment. These compartments are separated by medial and lateral intermuscular septa, which extend from the deep fascia of the arm to the humerus. This compartmentalization helps in organizing muscles with similar functions, innervation, and blood supply, and also plays a crucial role in clinical conditions like compartment syndrome.

## Location & Anatomy

### Anterior Compartment

*   **Location:** Lies anterior to the humerus, bounded by the medial and lateral intermuscular septa.
*   **Muscles:** Contains three muscles: Biceps Brachii, Coracobrachialis, and Brachialis.
*   **Primary Function:** Primarily responsible for flexion of the forearm at the elbow joint and flexion/adduction of the arm at the shoulder joint.

### Posterior Compartment

*   **Location:** Lies posterior to the humerus, bounded by the medial and lateral intermuscular septa.
*   **Muscles:** Contains one primary muscle: Triceps Brachii. The Anconeus muscle, though primarily in the forearm, is functionally related to the triceps and assists in elbow extension.
*   **Primary Function:** Primarily responsible for extension of the forearm at the elbow joint.

## Structure & Relations

### Anterior Compartment

*   **Biceps Brachii:** Superficial, two-headed muscle. The long head passes through the shoulder joint capsule. Its distal tendon forms the bicipital aponeurosis, which blends with the deep fascia of the forearm.
*   **Coracobrachialis:** Most medial muscle in the anterior compartment, piercing the musculocutaneous nerve. It acts as a landmark for neurovascular structures in the axilla.
*   **Brachialis:** Lies deep to the biceps brachii, forming the floor of the cubital fossa. It is the strongest flexor of the elbow.

### Posterior Compartment

*   **Triceps Brachii:** Large, three-headed muscle. The long head crosses the shoulder joint, while the lateral and medial heads originate from the humerus. The radial nerve and profunda brachii artery lie in the radial groove of the humerus, deep to the lateral and medial heads.
*   **Anconeus:** Small, triangular muscle located at the posterior aspect of the elbow, often blended with the triceps.

## Innervation & Blood Supply

### Anterior Compartment

*   **Innervation:** Primarily by the **Musculocutaneous Nerve** (C5-C7), which pierces the coracobrachialis muscle. The brachialis also receives a small contribution from the radial nerve.
*   **Blood Supply:** Muscular branches of the **Brachial Artery**.

### Posterior Compartment

*   **Innervation:** Primarily by the **Radial Nerve** (C6-C8), which runs in the radial groove of the humerus.
*   **Blood Supply:** **Profunda Brachii Artery** (deep brachial artery), a large branch of the brachial artery, and superior ulnar collateral arteries.

## Anterior Compartment Muscles

The anterior compartment of the upper arm contains three muscles: Biceps Brachii, Coracobrachialis, and Brachialis. All are innervated by the musculocutaneous nerve (BBC - Biceps, Brachialis, Coracobrachialis).

### Biceps Brachii
*   **Attachments:** Long head originates from the supraglenoid tubercle of the scapula; short head originates from the coracoid process of the scapula. Both heads insert distally into the radial tuberosity and the fascia of the forearm via the bicipital aponeurosis.
*   **Function:** Supination of the forearm, flexion of the arm at the elbow and at the shoulder. The long head also stabilizes the shoulder joint.
*   **Innervation:** Musculocutaneous nerve (C5-C6). Bicep tendon reflex tests spinal cord segment C6.
*   **Blood Supply:** Brachial artery.

### Coracobrachialis
*   **Attachments:** Originates from the coracoid process of the scapula; attaches to the medial side of the humeral shaft at the level of the deltoid tubercle.
*   **Function:** Strong adductor and weak flexor of the arm at the shoulder joint.
*   **Innervation:** Musculocutaneous nerve (C5-C6).
*   **Blood Supply:** Muscular branches of the brachial artery.

### Brachialis
*   **Attachments:** Originates from the distal half of the anterior surface of the humerus; inserts into the coronoid process and tuberosity of the ulna.
*   **Function:** Main flexor of the forearm at the elbow joint.
*   **Innervation:** Musculocutaneous nerve (C5, C6), with contributions from the radial nerve (C7).
*   **Blood Supply:** Brachial, radial recurrent arteries, and branches of the inferior ulnar collateral arteries.

## Posterior Compartment Muscles

The posterior compartment of the upper arm contains one muscle: Triceps Brachii.

### Triceps Brachii
*   **Attachments:**
    *   Long head originates from the infraglenoid tubercle of the scapula.
    *   Lateral head originates from the humerus (superior to the radial groove).
    *   Medial head originates from the humerus (inferior to the radial groove).
    *   Distally, the heads converge into one tendon which inserts onto the olecranon of the ulna.
*   **Function:** Prime extensor of the forearm at the elbow joint. Can also act as a weak extensor and adductor of the arm at the shoulder joint.
*   **Innervation:** Radial nerve (C6-C8). Triceps tendon reflex tests spinal segment C7. (Note: In some individuals, the long head of the triceps brachii is innervated by the axillary nerve.)
*   **Blood Supply:** Profunda brachii artery and superior ulnar collateral arteries.

## Function

### Anterior Compartment Muscles

*   **Biceps Brachii:** Primarily responsible for powerful supination of the forearm (e.g., turning a screwdriver) and flexion of the elbow. It also contributes to weak flexion of the arm at the shoulder joint. The long head also acts as a dynamic stabilizer of the shoulder joint, preventing upward displacement of the humeral head.
*   **Coracobrachialis:** Acts as a strong adductor of the arm at the shoulder joint and a weak flexor of the arm at the shoulder joint. It helps to stabilize the humeral head in the glenoid cavity.
*   **Brachialis:** Considered the workhorse of elbow flexion, as it is the primary and most powerful flexor of the forearm at the elbow joint, regardless of forearm position (pronation or supination).

### Posterior Compartment Muscles

*   **Triceps Brachii:** The primary and most powerful extensor of the forearm at the elbow joint. All three heads contribute to this action. The long head also assists in adduction and extension of the arm at the shoulder joint.
*   **Anconeus:** Assists the triceps brachii in elbow extension and helps to stabilize the elbow joint during pronation and supination. It also pulls the synovial membrane of the elbow joint out of the way during extension, preventing it from being pinched.

## Clinical Relevance

### Compartment Syndrome

*   **Description:** A condition where increased pressure within a confined fascial compartment compromises the circulation and function of the tissues within that space. While more common in the forearm and leg, it can occur in the arm due to trauma, fractures, or severe muscle swelling.
*   **Symptoms:** Severe pain out of proportion to the injury, pallor, paresthesia, pulselessness (late sign), and paralysis (late sign).
*   **Treatment:** Requires urgent fasciotomy to relieve pressure and prevent irreversible tissue damage.

### Radial Nerve Injury

*   **Description:** Injury to the radial nerve, particularly in the radial groove of the humerus (e.g., due to humeral shaft fractures or prolonged compression), can affect the triceps brachii and other extensor muscles of the forearm.
*   **Symptoms:** Weakness or paralysis of elbow extension (if injury is high in the arm), and more commonly, **wrist drop** (inability to extend the wrist and fingers) due to paralysis of forearm extensors.

### Musculocutaneous Nerve Injury

*   **Description:** Injury to the musculocutaneous nerve can result in weakness of elbow flexion and forearm supination, as well as sensory loss over the lateral forearm.

### Rupture of the Biceps Tendon

*   A complete rupture of the long head of the biceps tendon is one of the more common tendon ruptures.
*   **Sign:** Produces a characteristic bulge where the muscle belly is, known as the **'Popeye Sign'**.
*   **Weakness:** Patients may not experience significant weakness in the upper limb due to the compensatory actions of the brachialis and supinator muscles.

## Mnemonics

*   **Anterior Compartment Muscles (BBC):** **B**iceps Brachii, **B**rachialis, **C**oracobrachialis. (Innervated by **M**usculocutaneous nerve, which also starts with M, for **M**uscles of the **B**BC).
*   **Radial Nerve Injury (WRIST):** **W**rist **R**adius **I**njury **S**upination **T**riceps. (This mnemonic helps remember that radial nerve injury can lead to wrist drop, affects supination, and innervates the triceps.)

## Summary Table / Cheat Sheet

| Feature             | Anterior Compartment of Arm                                | Posterior Compartment of Arm                             |
| :------------------ | :--------------------------------------------------------- | :------------------------------------------------------- |
| **Muscles**         | Biceps Brachii, Coracobrachialis, Brachialis             | Triceps Brachii, (Anconeus - functionally related)       |
| **Primary Function**| Flexion of forearm at elbow, flexion/adduction of arm at shoulder | Extension of forearm at elbow                            |
| **Innervation**     | Musculocutaneous Nerve (C5-C7)                           | Radial Nerve (C6-C8)                                     |
| **Blood Supply**    | Muscular branches of Brachial Artery                     | Profunda Brachii Artery, Superior Ulnar Collateral Arteries |
| **Clinical Notes**  | Biceps Tendon Rupture (Popeye Sign)                      | Radial Nerve Injury (Wrist Drop)                         |

## Key Diagrams

*(Note: Actual diagrams will be inserted or referenced here. For now, placeholders are used.)*

*   **Anterior Compartment Muscles:** Diagram showing the Biceps Brachii, Coracobrachialis, and Brachialis muscles in relation to the humerus and scapula.
*   **Posterior Compartment Muscles:** Diagram illustrating the Triceps Brachii and Anconeus muscles.
*   **Cross-section of the Arm:** Diagram depicting the fascial compartments, intermuscular septa, and the neurovascular structures within each compartment.
*   **Innervation Pathways:** Simplified diagram showing the musculocutaneous and radial nerve pathways to the arm muscles.
*   **Blood Supply:** Diagram illustrating the brachial artery and its branches supplying the arm.

## References

1. Snell, R. S. (2012). *Clinical Anatomy by Regions* (9th ed.). Lippincott Williams & Wilkins.
2. TeachMeAnatomy. (n.d.). *Human Upper Limb Anatomy*. Retrieved from [https://teachmeanatomy.info/upper-limb/](https://teachmeanatomy.info/upper-limb/)
3. Kenhub. (n.d.). *Upper Limb Anatomy*. Retrieved from [https://www.kenhub.com/en/library/anatomy/upper-limb](https://www.kenhub.com/en/library/anatomy/upper-limb)`
        },
        {
          id: 'brachial-plexus',
          name: 'Brachial Plexus',
          description: 'Nerve network of the upper limb',
          content: `# 📌 Brachial Plexus

## 1. Overview

The brachial plexus is a complex network of nerves responsible for the motor and sensory innervation of the entire upper limb, including the shoulder, arm, forearm, and hand. It is formed by the anterior rami (ventral primary rami) of the lower four cervical spinal nerves (C5, C6, C7, C8) and the first thoracic spinal nerve (T1). This intricate network allows for the distribution of nerve fibers from multiple spinal levels to various muscles and skin regions, ensuring comprehensive control and sensation. The plexus is organized into five main parts, from proximal to distal: Roots, Trunks, Divisions, Cords, and Branches. This structural organization facilitates the efficient transmission of neural signals and is crucial for understanding the clinical implications of injuries to different parts of the plexus.

## 2. Location & Anatomy

The brachial plexus originates in the neck, passes through the cervicoaxillary canal, and extends into the axilla, ultimately distributing its terminal branches throughout the upper extremity. Its formation begins with the **roots**, which are the anterior primary rami of spinal nerves C5, C6, C7, C8, and T1. These roots emerge from the intervertebral foramina and pass between the anterior and middle scalene muscles in the neck.

These roots then converge to form three **trunks** in the posterior triangle of the neck:
*   **Superior Trunk**: Formed by the union of C5 and C6 roots.
*   **Middle Trunk**: A continuation of the C7 root.
*   **Inferior Trunk**: Formed by the union of C8 and T1 roots.

As the trunks traverse laterally, they pass over the first rib and behind the clavicle. Each trunk then divides into an **anterior division** and a **posterior division** as they enter the axilla. There are no branches from the divisions. These divisions then recombine to form three **cords**, named according to their relationship to the second part of the axillary artery:
*   **Lateral Cord**: Formed by the anterior divisions of the superior and middle trunks.
*   **Posterior Cord**: Formed by the posterior divisions of all three trunks (superior, middle, and inferior).
*   **Medial Cord**: A direct continuation of the anterior division of the inferior trunk.

These cords then give rise to the major terminal branches of the brachial plexus, which innervate the various muscles and skin regions of the upper limb.

## 3. Structure & Relations

The intricate structure of the brachial plexus allows for a complex distribution of nerve fibers, ensuring that each part of the upper limb receives innervation from multiple spinal segments. The relationship of the plexus to surrounding anatomical structures is clinically significant, as compression or injury at various points can lead to distinct neurological deficits.

**Roots (C5-T1):**
*   **Origin**: Anterior rami of C5-T1 spinal nerves, emerging from the intervertebral foramina.
*   **Course**: Pass between the anterior and middle scalene muscles. The dorsal scapular nerve (C5) and long thoracic nerve (C5-C7) are direct branches from the roots.
*   **Relations**: Closely related to the vertebral column and the scalene muscles. Compression here can lead to symptoms affecting the entire plexus or specific root-derived nerves.

**Trunks (Superior, Middle, Inferior):**
*   **Formation**: Superior (C5, C6), Middle (C7), Inferior (C8, T1).
*   **Course**: Traverse the posterior triangle of the neck, superior to the first rib and posterior to the subclavian artery.
*   **Relations**: The superior trunk gives rise to the suprascapular nerve and the nerve to the subclavius. Injuries in this region, such as Erb's palsy, typically affect the C5 and C6 derived muscles.

**Divisions (Anterior and Posterior):**
*   **Formation**: Each of the three trunks divides into an anterior and a posterior division as they pass behind the clavicle.
*   **Course**: These six divisions (three anterior, three posterior) pass into the axilla.
*   **Relations**: The divisions do not give off any branches. Their primary role is to reorganize nerve fibers, ensuring that flexor and extensor compartments of the limb are supplied by distinct nerve bundles.

**Cords (Lateral, Posterior, Medial):**
*   **Formation**: Formed by the recombination of the divisions, named according to their relationship to the second part of the axillary artery.
    *   **Lateral Cord**: Formed by the anterior divisions of the superior and middle trunks.
    *   **Posterior Cord**: Formed by the posterior divisions of all three trunks.
    *   **Medial Cord**: A direct continuation of the anterior division of the inferior trunk.
*   **Course**: Located within the axilla, surrounding the axillary artery.
*   **Relations**: The cords give rise to several important branches before terminating as the major nerves of the upper limb. Their close proximity to the axillary artery makes them vulnerable to vascular injuries or compression.

## 4. Function

The primary function of the brachial plexus is to provide both motor and sensory innervation to the entire upper limb. This comprehensive innervation allows for a wide range of movements and sensations, from fine motor skills in the hand to powerful movements of the shoulder and arm.

**Motor Function:**
*   **Shoulder Movement**: Nerves from the brachial plexus innervate muscles responsible for shoulder flexion, extension, abduction, adduction, internal rotation, and external rotation (e.g., deltoid, rotator cuff muscles, latissimus dorsi, pectoralis major).
*   **Arm Movement**: Muscles in the arm, such as the biceps brachii, brachialis, and triceps brachii, which are responsible for elbow flexion and extension, are innervated by branches of the brachial plexus (musculocutaneous and radial nerves).
*   **Forearm Movement**: The plexus supplies muscles that control pronation and supination of the forearm, as well as flexion and extension of the wrist and fingers (e.g., median and ulnar nerves for flexors, radial nerve for extensors).
*   **Hand Movement**: Intrinsic muscles of the hand, crucial for fine motor control, grip, and dexterity, receive innervation from the median and ulnar nerves.

**Sensory Function:**
*   The brachial plexus carries sensory fibers that provide sensation (touch, pain, temperature, proprioception) from the skin and deep tissues of the shoulder, arm, forearm, and hand. Each terminal nerve typically has a specific cutaneous distribution, allowing for localization of sensory deficits in cases of nerve injury.

**Proprioception:**
*   Beyond motor and sensory roles, the brachial plexus also plays a vital role in proprioception, the sense of the relative position of one's own body parts and strength of effort being employed in movement. This allows for coordinated and precise movements without constant visual feedback.

In essence, the brachial plexus acts as a critical conduit, translating signals from the spinal cord into the complex and varied functions of the upper limb.

## 5. Innervation & Blood Supply

The brachial plexus is the primary source of innervation for the upper limb, with its various components giving rise to numerous nerves that supply specific muscles and cutaneous regions. The blood supply to the plexus itself is also crucial for its function.

**Innervation (Terminal Branches and their Primary Innervation):**

*   **Musculocutaneous Nerve (C5-C7)**:
    *   **Motor**: Coracobrachialis, biceps brachii, brachialis (muscles of the anterior compartment of the arm).
    *   **Sensory**: Lateral forearm (via lateral antebrachial cutaneous nerve).

*   **Axillary Nerve (C5-C6)**:
    *   **Motor**: Deltoid, teres minor.
    *   **Sensory**: Skin over the inferior deltoid region (regimental badge area).

*   **Radial Nerve (C5-T1)**:
    *   **Motor**: All muscles in the posterior compartment of the arm and forearm (e.g., triceps brachii, anconeus, brachioradialis, extensors of the wrist and fingers).
    *   **Sensory**: Posterior arm, posterior forearm, and posterolateral aspect of the hand.

*   **Median Nerve (C6-T1, with occasional C5 contribution)**:
    *   **Motor**: Most flexor muscles in the forearm (except flexor carpi ulnaris and medial half of flexor digitorum profundus), thenar muscles, and lateral two lumbricals.
    *   **Sensory**: Lateral palm, lateral 3.5 fingers (palmar surface).

*   **Ulnar Nerve (C8-T1)**:
    *   **Motor**: Flexor carpi ulnaris, medial half of flexor digitorum profundus, and most intrinsic hand muscles (except thenar muscles and lateral two lumbricals).
    *   **Sensory**: Medial 1.5 fingers (anterior and posterior surfaces) and associated palm area.

**Innervation (Collateral Branches):**

*   **From Roots**:
    *   **Dorsal Scapular Nerve (C5)**: Rhomboid major and minor, levator scapulae.
    *   **Long Thoracic Nerve (C5-C7)**: Serratus anterior.

*   **From Trunks**:
    *   **Suprascapular Nerve (C5-C6)**: Supraspinatus, infraspinatus.
    *   **Nerve to Subclavius (C5-C6)**: Subclavius.

*   **From Cords**:
    *   **Lateral Pectoral Nerve (C5-C7)** (from Lateral Cord): Pectoralis major.
    *   **Medial Pectoral Nerve (C8-T1)** (from Medial Cord): Pectoralis major and minor.
    *   **Medial Brachial Cutaneous Nerve (C8-T1)** (from Medial Cord): Medial side of the arm.
    *   **Medial Antebrachial Cutaneous Nerve (C8-T1)** (from Medial Cord): Medial side of the forearm.
    *   **Upper Subscapular Nerve (C5-C6)** (from Posterior Cord): Subscapularis.
    *   **Thoracodorsal Nerve (C6-C8)** (from Posterior Cord): Latissimus dorsi.
    *   **Lower Subscapular Nerve (C5-C6)** (from Posterior Cord): Subscapularis, teres major.

**Blood Supply:**

The brachial plexus receives its blood supply primarily from branches of the **subclavian artery** and its continuation, the **axillary artery**. Specific branches include:

*   **Ascending and Deep Cervical Arteries**: Supply the roots and trunks.
*   **Subclavian, Axillary, and Subscapular Arteries**: Supply the cords.

This rich vascularization ensures the metabolic demands of the nerve tissue are met, and disruption of this supply can compromise nerve function.

## 6. Clinical Relevance

Injuries to the brachial plexus can result in significant motor and sensory deficits in the upper limb, depending on the location and severity of the damage. Understanding the clinical relevance of the brachial plexus anatomy is crucial for diagnosis and treatment.

**Types of Brachial Plexus Injuries:**

*   **Erb's Palsy (Upper Brachial Plexus Injury)**:
    *   **Affected Roots**: Typically C5 and C6.
    *   **Cause**: Often results from excessive traction on the neck during childbirth (e.g., shoulder dystocia) or trauma (e.g., falls, motorcycle accidents).
    *   **Presentation**: The classic presentation is the "waiter's tip" position: the arm is adducted, internally rotated at the shoulder, with the elbow extended and the forearm pronated. This is due to paralysis of muscles supplied by the axillary, musculocutaneous, and suprascapular nerves (e.g., deltoid, biceps brachii, brachialis, supraspinatus, infraspinatus).
    *   **Recovery**: Many cases in infants resolve spontaneously, but severe injuries may require surgical intervention and extensive physical therapy.

*   **Klumpke's Palsy (Lower Brachial Plexus Injury)**:
    *   **Affected Roots**: Typically C8 and T1.
    *   **Cause**: Often caused by excessive abduction of the arm, such as when a person falls from a height and grasps something to break the fall, or during childbirth if the arm is pulled excessively.
    *   **Presentation**: Characterized by paralysis of the intrinsic hand muscles, leading to a "claw hand" deformity (hyperextension of metacarpophalangeal joints and flexion of interphalangeal joints). If the T1 root is involved, a **Horner's syndrome** (ptosis, miosis, anhidrosis) may also be present due to damage to sympathetic fibers that travel with T1.

*   **Thoracic Outlet Syndrome (TOS)**:
    *   **Cause**: Compression of the neurovascular structures (brachial plexus, subclavian artery, and vein) as they pass through the thoracic outlet, the space between the clavicle, first rib, and scalene muscles. This can be due to anatomical variations (e.g., cervical rib), trauma, or repetitive strain.
    *   **Presentation**: Symptoms vary depending on the compressed structures but often include pain, numbness, tingling, and weakness in the arm and hand (neurological TOS), or swelling and discoloration (vascular TOS).

**Other Clinical Considerations:**

*   **Fractures**: Fractures of the clavicle or humerus can directly injure parts of the brachial plexus.
*   **Dislocations**: Shoulder dislocations, particularly anterior dislocations, can stretch or damage the axillary nerve, a terminal branch of the brachial plexus.
*   **Tumors**: Tumors in the neck or axilla can compress the brachial plexus, leading to progressive neurological deficits.
*   **Inflammation/Infection**: Conditions like brachial neuritis (Parsonage-Turner syndrome) involve inflammation of the brachial plexus, causing severe pain and weakness.

Understanding the specific nerve roots and terminal branches involved in different injuries is crucial for accurate diagnosis and effective management of brachial plexus pathologies.

## 7. Mnemonics

Mnemonics are helpful tools for remembering the complex organization and branches of the brachial plexus.

*   **Organization (Roots, Trunks, Divisions, Cords, Branches)**:
    *   **R**ead **T**hat **D**amn **C**adaver **B**ook

*   **Lateral Cord Branches**:
    *   **L**ong **L**egged **M**overs (Lateral pectoral nerve, Lateral root of median nerve, Musculocutaneous nerve)

*   **Medial Cord Branches**:
    *   **M**ake **M**any **M**oves **U**sing **M**uscles (Medial cutaneous brachial nerve, Medial cutaneous antebrachial nerve, Medial pectoral nerve, Ulnar nerve, Median root of median nerve)

*   **Posterior Cord Branches**:
    *   **ULTRA** competitive (Upper subscapular nerve, Lower subscapular nerve, Thoracodorsal nerve, Radial nerve, Axillary nerve)

*   **Nerve Lesions (Clinical Presentation)**:
    *   **DR. CUMA** (Dropped wrist = Radial nerve lesion, Claw hand = Ulnar nerve lesion, Ape hand = Median nerve lesion)

## 8. Summary Table / Cheat Sheet

| Component | Formation/Origin | Key Branches/Innervation | Clinical Notes |
| :-------- | :--------------- | :----------------------- | :------------- |
| **Roots** (C5-T1) | Anterior rami of C5-T1 spinal nerves | Dorsal Scapular (C5), Long Thoracic (C5-C7) | Emerge between scalene muscles; vulnerable to neck trauma. |
| **Trunks** | Superior (C5, C6), Middle (C7), Inferior (C8, T1) | Suprascapular (C5-C6), Nerve to Subclavius (C5-C6) | Located in posterior triangle of neck; Erb's Palsy (C5-C6 injury). |
| **Divisions** | Each trunk divides into Anterior & Posterior divisions | None | Reorganize fibers for flexor/extensor compartments. |
| **Cords** | Lateral (Ant. Sup. & Mid. Div.), Posterior (All Post. Div.), Medial (Ant. Inf. Div.) | Lateral Pectoral, Medial Pectoral, Medial Brachial Cutaneous, Medial Antebrachial Cutaneous, Upper Subscapular, Thoracodorsal, Lower Subscapular | Named relative to axillary artery; vulnerable to axillary trauma/compression. |
| **Terminal Branches** | Formed from cords | Musculocutaneous, Axillary, Radial, Median, Ulnar | Provide motor and sensory innervation to specific upper limb regions. |
| **Musculocutaneous Nerve** (C5-C7) | Lateral Cord | Biceps, Brachialis, Coracobrachialis; lateral forearm sensation | |
| **Axillary Nerve** (C5-C6) | Posterior Cord | Deltoid, Teres Minor; skin over deltoid | Vulnerable in shoulder dislocations. |
| **Radial Nerve** (C5-T1) | Posterior Cord | All posterior arm/forearm muscles (extensors); posterior arm/forearm/hand sensation | Wrist drop if injured. |
| **Median Nerve** (C6-T1) | Lateral & Medial Cords | Most forearm flexors, thenar muscles; lateral palm/fingers sensation | Carpal tunnel syndrome. |
| **Ulnar Nerve** (C8-T1) | Medial Cord | Flexor Carpi Ulnaris, medial Flexor Digitorum Profundus, most intrinsic hand muscles; medial palm/fingers sensation | Claw hand if injured. |`
        },
        {
          id: 'cubital-fossa',
          name: 'Cubital Fossa',
          description: 'Elbow region anatomy'
        },
        {
          id: 'forearm-compartments',
          name: 'Forearm (Anterior and Posterior Compartments)',
          description: 'Forearm muscle compartments',
          content: `# Upper Limb Anatomy: Forearm (Anterior and Posterior Compartments)

## 1. Overview

The forearm, or antebrachium, is the region of the upper limb extending from the elbow to the wrist. It consists of two long bones, the radius (lateral) and the ulna (medial), which are connected by an interosseous membrane. This anatomical arrangement, along with the fibrous intermuscular septa, divides the forearm into two primary compartments: the anterior (flexor) compartment and the posterior (extensor) compartment. These compartments house distinct groups of muscles responsible for a wide range of movements at the wrist, hand, and digits, as well as pronation and supination of the forearm itself. Each compartment also has its specific innervation and blood supply, which are crucial for their function and clinical understanding.

## 2. Location & Anatomy

The forearm is positioned between the elbow joint proximally and the wrist joint distally. Its bony framework comprises the radius and the ulna. The ulna is the medial bone, generally longer and larger than the radius, which is positioned laterally. These two bones articulate at the proximal and distal radioulnar joints, allowing for pronation and supination movements. The interosseous membrane, a strong fibrous sheet, connects the shafts of the radius and ulna, providing an attachment site for muscles and transmitting forces between the two bones.

### Compartments:

The forearm is functionally divided into two main compartments by the interosseous membrane and a lateral intermuscular septum:

*   **Anterior (Flexor) Compartment:** This compartment is located on the palmar aspect of the forearm. It primarily contains muscles responsible for flexion of the wrist and digits, as well as pronation of the forearm. These muscles are typically arranged in superficial, intermediate, and deep layers.
*   **Posterior (Extensor) Compartment:** This compartment is located on the dorsal aspect of the forearm. It primarily contains muscles responsible for extension of the wrist and digits, and supination of the forearm. These muscles are generally arranged in superficial and deep layers.

## 3. Structure & Relations

### Anterior (Flexor) Compartment Muscles:

The muscles of the anterior compartment are primarily flexors and pronators, arranged in three layers:

#### Superficial Layer:

These muscles generally originate from the common flexor origin at the medial epicondyle of the humerus.

*   **Pronator Teres:**
    *   **Attachments:** Medial epicondyle of humerus and coronoid process of ulna to lateral mid-shaft of radius.
    *   **Actions:** Pronates the forearm and weakly flexes the elbow.
    *   **Relations:** Forms the medial border of the cubital fossa. The median nerve passes between its two heads.
*   **Flexor Carpi Radialis:**
    *   **Attachments:** Medial epicondyle of humerus to base of metacarpals II and III.
    *   **Actions:** Flexes and abducts the wrist.
*   **Palmaris Longus:**
    *   **Attachments:** Medial epicondyle of humerus to flexor retinaculum and palmar aponeurosis. (Absent in ~15% of population).
    *   **Actions:** Flexes the wrist and tenses the palmar aponeurosis.
*   **Flexor Carpi Ulnaris:**
    *   **Attachments:** Humeral head from medial epicondyle, ulnar head from olecranon and posterior border of ulna, to pisiform, hook of hamate, and base of 5th metacarpal.
    *   **Actions:** Flexes and adducts the wrist.
    *   **Relations:** The ulnar nerve and ulnar artery lie deep to this muscle.

#### Intermediate Layer:

*   **Flexor Digitorum Superficialis (FDS):**
    *   **Attachments:** Medial epicondyle of humerus, coronoid process of ulna, and radial shaft, to middle phalanges of digits 2-5.
    *   **Actions:** Flexes the metacarpophalangeal (MCP) and proximal interphalangeal (PIP) joints of digits 2-5, and flexes the wrist.
    *   **Relations:** The median nerve and ulnar artery pass between its two heads.

#### Deep Layer:

*   **Flexor Digitorum Profundus (FDP):**
    *   **Attachments:** Anterior and medial surfaces of ulna and interosseous membrane, to distal phalanges of digits 2-5.
    *   **Actions:** Flexes the distal interphalangeal (DIP), PIP, and MCP joints of digits 2-5, and flexes the wrist. It is the only muscle that can flex the DIP joints.
    *   **Relations:** Lies deep to FDS. The median nerve (anterior interosseous branch) innervates the lateral half (index and middle fingers), and the ulnar nerve innervates the medial half (ring and little fingers).
*   **Flexor Pollicis Longus (FPL):**
    *   **Attachments:** Anterior surface of radius and interosseous membrane, to distal phalanx of the thumb.
    *   **Actions:** Flexes the interphalangeal (IP) and MCP joints of the thumb.
    *   **Relations:** Lies lateral to FDP.
*   **Pronator Quadratus:**
    *   **Attachments:** Anterior surface of distal ulna to anterior surface of distal radius.
    *   **Actions:** Primary pronator of the forearm; holds the radius and ulna together distally.
    *   **Relations:** Deepest muscle in the anterior compartment.

### Posterior (Extensor) Compartment Muscles:

The muscles of the posterior compartment are primarily extensors and supinators, arranged in two layers:

#### Superficial Layer:

These muscles generally originate from the common extensor origin at the lateral epicondyle of the humerus.

*   **Brachioradialis:**
    *   **Attachments:** Lateral supracondylar ridge of humerus to styloid process of radius.
    *   **Actions:** Flexes the elbow, especially in mid-pronation. Does not act on the wrist or hand.
    *   **Relations:** Forms the lateral border of the cubital fossa. The radial artery and nerve lie deep to it distally.
*   **Extensor Carpi Radialis Longus (ECRL):**
    *   **Attachments:** Lateral supracondylar ridge of humerus to base of metacarpal II.
    *   **Actions:** Extends and abducts the wrist.
*   **Extensor Carpi Radialis Brevis (ECRB):**
    *   **Attachments:** Lateral epicondyle of humerus to base of metacarpal III.
    *   **Actions:** Extends and abducts the wrist.
*   **Extensor Digitorum (ED):**
    *   **Attachments:** Lateral epicondyle of humerus to extensor expansions of digits 2-5.
    *   **Actions:** Extends the MCP and IP joints of digits 2-5, and extends the wrist.
*   **Extensor Digiti Minimi (EDM):**
    *   **Attachments:** Lateral epicondyle of humerus to extensor expansion of digit 5.
    *   **Actions:** Extends the little finger.
*   **Extensor Carpi Ulnaris (ECU):**
    *   **Attachments:** Lateral epicondyle of humerus and posterior border of ulna to base of metacarpal V.
    *   **Actions:** Extends and adducts the wrist.
*   **Anconeus:**
    *   **Attachments:** Lateral epicondyle of humerus to olecranon and posterior surface of ulna.
    *   **Actions:** Assists triceps in elbow extension; stabilizes the elbow joint.

#### Deep Layer:

*   **Supinator:**
    *   **Attachments:** Lateral epicondyle of humerus, radial collateral ligament, annular ligament, and supinator crest of ulna, to proximal radius.
    *   **Actions:** Supinates the forearm.
    *   **Relations:** The deep branch of the radial nerve passes through this muscle.
*   **Abductor Pollicis Longus (APL):**
    *   **Attachments:** Posterior surfaces of ulna, radius, and interosseous membrane, to base of metacarpal I.
    *   **Actions:** Abducts and extends the thumb at the carpometacarpal (CMC) joint.
    *   **Relations:** Forms the lateral border of the anatomical snuffbox.
*   **Extensor Pollicis Brevis (EPB):**
    *   **Attachments:** Posterior surface of radius and interosseous membrane, to proximal phalanx of the thumb.
    *   **Actions:** Extends the thumb at the MCP joint.
    *   **Relations:** Forms the lateral border of the anatomical snuffbox, alongside APL.
*   **Extensor Pollicis Longus (EPL):**
    *   **Attachments:** Posterior surface of ulna and interosseous membrane, to distal phalanx of the thumb.
    *   **Actions:** Extends the thumb at the IP, MCP, and CMC joints.
    *   **Relations:** Forms the medial border of the anatomical snuffbox. Its tendon hooks around Lister's tubercle on the radius.
*   **Extensor Indicis (EI):**
    *   **Attachments:** Posterior surface of ulna and interosseous membrane, to extensor expansion of the index finger.
    *   **Actions:** Extends the index finger independently of other digits.

## 4. Function

The muscles of the forearm are crucial for a wide array of movements involving the elbow, forearm, wrist, and digits. Their functions can be broadly categorized based on their compartment:

### Anterior Compartment (Flexors and Pronators):

*   **Wrist Flexion:** Muscles like Flexor Carpi Radialis, Flexor Carpi Ulnaris, and Palmaris Longus are the primary movers for bending the wrist anteriorly.
*   **Finger Flexion:** Flexor Digitorum Superficialis and Flexor Digitorum Profundus are responsible for flexing the fingers at various joints (MCP, PIP, DIP). Flexor Pollicis Longus specifically flexes the thumb.
*   **Forearm Pronation:** Pronator Teres and Pronator Quadratus are the key muscles that rotate the forearm medially, turning the palm downwards.
*   **Wrist Adduction/Abduction:** Flexor Carpi Ulnaris contributes to wrist adduction (moving the hand towards the little finger side), while Flexor Carpi Radialis contributes to wrist abduction (moving the hand towards the thumb side).

### Posterior Compartment (Extensors and Supinators):

*   **Wrist Extension:** Extensor Carpi Radialis Longus, Extensor Carpi Radialis Brevis, and Extensor Carpi Ulnaris are responsible for bending the wrist posteriorly.
*   **Finger Extension:** Extensor Digitorum, Extensor Digiti Minimi, and Extensor Indicis extend the fingers at the MCP and IP joints.
*   **Thumb Extension and Abduction:** Extensor Pollicis Longus, Extensor Pollicis Brevis, and Abductor Pollicis Longus are specifically involved in extending and moving the thumb away from the palm.
*   **Forearm Supination:** The Supinator muscle, along with the biceps brachii (which is in the arm but also supinates the forearm), rotates the forearm laterally, turning the palm upwards.
*   **Elbow Flexion/Extension:** While primarily forearm muscles, Brachioradialis assists in elbow flexion, and Anconeus assists in elbow extension and stabilizes the elbow joint.

## 5. Innervation & Blood Supply

### Innervation:

The innervation of the forearm muscles is primarily provided by branches of the median, ulnar, and radial nerves, all originating from the brachial plexus.

*   **Median Nerve:**
    *   Innervates most muscles of the **anterior (flexor) compartment**, including Pronator Teres, Flexor Carpi Radialis, Palmaris Longus, Flexor Digitorum Superficialis, Flexor Pollicis Longus, and Pronator Quadratus.
    *   The **anterior interosseous nerve**, a branch of the median nerve, supplies Flexor Pollicis Longus, Pronator Quadratus, and the lateral half of Flexor Digitorum Profundus.
*   **Ulnar Nerve:**
    *   Innervates Flexor Carpi Ulnaris and the medial half of Flexor Digitorum Profundus (which acts on the ring and little fingers) in the **anterior compartment**.
*   **Radial Nerve:**
    *   Innervates all muscles of the **posterior (extensor) compartment**, including Brachioradialis, Extensor Carpi Radialis Longus, Extensor Carpi Radialis Brevis, Extensor Digitorum, Extensor Digiti Minimi, Extensor Carpi Ulnaris, Anconeus, Supinator, Abductor Pollicis Longus, Extensor Pollicis Brevis, Extensor Pollicis Longus, and Extensor Indicis.
    *   The **deep branch of the radial nerve** (which becomes the posterior interosseous nerve after passing through the supinator) supplies most of the deep extensors.

### Blood Supply:

The primary arterial supply to the forearm is provided by the brachial artery, which bifurcates into the radial and ulnar arteries just below the cubital fossa.

*   **Radial Artery:**
    *   Travels along the lateral side of the forearm, supplying muscles in the lateral and anterior compartments. It gives off the radial recurrent artery and muscular branches.
*   **Ulnar Artery:**
    *   Travels along the medial side of the forearm, supplying muscles in the medial and anterior compartments. It gives off the anterior and posterior ulnar recurrent arteries, and the common interosseous artery.
    *   The **common interosseous artery** further divides into the anterior interosseous artery and posterior interosseous artery, which supply the deep muscles of both anterior and posterior compartments, respectively.
*   **Venous Drainage:**
    *   The venous drainage of the forearm is primarily via superficial veins (cephalic, basilic, and median cubital veins) and deep veins (radial and ulnar veins), which eventually drain into the axillary vein.

## 6. Clinical Relevance

Understanding the anatomy of the forearm compartments is vital for diagnosing and treating various clinical conditions. Several common pathologies are directly related to the muscles, nerves, and vessels within these compartments.

### Compartment Syndrome:

*   **Description:** This is a serious condition that occurs when increased pressure within a confined fascial compartment compromises the circulation and function of the tissues within that compartment. In the forearm, this can affect either the anterior or posterior compartments, or both.
*   **Causes:** Trauma (e.g., fractures, crush injuries), severe burns, or excessive exercise can lead to swelling and hemorrhage within a compartment, increasing pressure.
*   **Symptoms:** Severe pain disproportionate to the injury, pain on passive stretching of the muscles in the affected compartment, paresthesia (numbness or tingling), pallor, pulselessness (a late and ominous sign), and paralysis.
*   **Treatment:** Urgent fasciotomy (surgical incision of the fascia) is required to relieve pressure and prevent irreversible muscle and nerve damage (Volkmann's ischemic contracture).

### Epicondylitis:

These are common overuse injuries affecting the tendons around the elbow, specifically at the epicondyles of the humerus.

*   **Lateral Epicondylitis (Tennis Elbow):**
    *   **Description:** Inflammation and degeneration of the tendons of the common extensor origin at the lateral epicondyle. It primarily affects the Extensor Carpi Radialis Brevis.
    *   **Causes:** Repetitive wrist extension and supination, common in activities like tennis, painting, or using hand tools.
    *   **Symptoms:** Pain and tenderness on the lateral aspect of the elbow, often radiating down the forearm, worsened by gripping or extending the wrist against resistance.
*   **Medial Epicondylitis (Golfer's Elbow):**
    *   **Description:** Inflammation and degeneration of the tendons of the common flexor origin at the medial epicondyle. It primarily affects the Pronator Teres and Flexor Carpi Radialis.
    *   **Causes:** Repetitive wrist flexion and pronation, common in activities like golf, pitching, or throwing.
    *   **Symptoms:** Pain and tenderness on the medial aspect of the elbow, often radiating down the forearm, worsened by gripping or flexing the wrist against resistance.

### Nerve Entrapment Syndromes:

*   **Median Nerve Entrapment:** Can occur at various points in the forearm, such as between the two heads of the Pronator Teres (Pronator Teres Syndrome) or within the carpal tunnel at the wrist (Carpal Tunnel Syndrome).
*   **Ulnar Nerve Entrapment:** Can occur at the elbow (Cubital Tunnel Syndrome) or in the forearm.
*   **Radial Nerve Entrapment:** The deep branch of the radial nerve can be compressed as it passes through the Supinator muscle (Supinator Syndrome or Posterior Interosseous Nerve Syndrome), leading to weakness in extensor muscles.

### Wrist Drop:

*   **Description:** A clinical sign characterized by the inability to extend the wrist and fingers, resulting in a flexed wrist and digits. This is due to paralysis of the extensor muscles of the forearm.
*   **Cause:** Typically caused by damage to the radial nerve, often due to humeral shaft fractures or prolonged compression of the nerve in the axilla.

## 7. Mnemonics

### 'Rule of 3s' (from Kenhub):

This mnemonic helps categorize the forearm muscles by their primary actions:

*   **3 wrist flexors:** Flexor Carpi Radialis, Flexor Carpi Ulnaris, Palmaris Longus
*   **3 finger flexors:** Flexor Digitorum Superficialis, Flexor Digitorum Profundus, Flexor Pollicis Longus
*   **3 wrist extensors:** Extensor Carpi Radialis Longus, Extensor Carpi Radialis Brevis, Extensor Carpi Ulnaris
*   **3 finger extensors:** Extensor Digitorum, Extensor Indicis, Extensor Digiti Minimi
*   **3 thumb extensors:** Abductor Pollicis Longus, Extensor Pollicis Brevis, Extensor Pollicis Longus

## 8. Summary Table / Cheat Sheet

### Anterior Compartment

| Layer | Muscle | Origin | Insertion | Innervation | Action |
|---|---|---|---|---|---|
| **Superficial** | Pronator Teres | Medial epicondyle of humerus, coronoid process of ulna | Lateral mid-shaft of radius | Median nerve | Pronates forearm, flexes elbow |
| | Flexor Carpi Radialis | Medial epicondyle of humerus | Base of metacarpals II & III | Median nerve | Flexes and abducts wrist |
| | Palmaris Longus | Medial epicondyle of humerus | Flexor retinaculum, palmar aponeurosis | Median nerve | Flexes wrist, tenses palmar aponeurosis |
| | Flexor Carpi Ulnaris | Medial epicondyle of humerus, olecranon & posterior border of ulna | Pisiform, hook of hamate, base of metacarpal V | Ulnar nerve | Flexes and adducts wrist |
| **Intermediate** | Flexor Digitorum Superficialis | Medial epicondyle of humerus, coronoid process of ulna, radial shaft | Middle phalanges of digits 2-5 | Median nerve | Flexes MCP & PIP joints of digits 2-5, flexes wrist |
| **Deep** | Flexor Digitorum Profundus | Anterior & medial surfaces of ulna, interosseous membrane | Distal phalanges of digits 2-5 | Median nerve (lateral half), Ulnar nerve (medial half) | Flexes DIP, PIP, & MCP joints of digits 2-5, flexes wrist |
| | Flexor Pollicis Longus | Anterior surface of radius, interosseous membrane | Distal phalanx of thumb | Median nerve (anterior interosseous branch) | Flexes IP & MCP joints of thumb |
| | Pronator Quadratus | Anterior surface of distal ulna | Anterior surface of distal radius | Median nerve (anterior interosseous branch) | Pronates forearm |

### Posterior Compartment

| Layer | Muscle | Origin | Insertion | Innervation | Action |
|---|---|---|---|---|---|
| **Superficial** | Brachioradialis | Lateral supracondylar ridge of humerus | Styloid process of radius | Radial nerve | Flexes elbow |
| | Extensor Carpi Radialis Longus | Lateral supracondylar ridge of humerus | Base of metacarpal II | Radial nerve | Extends and abducts wrist |
| | Extensor Carpi Radialis Brevis | Lateral epicondyle of humerus | Base of metacarpal III | Radial nerve | Extends and abducts wrist |
| | Extensor Digitorum | Lateral epicondyle of humerus | Extensor expansions of digits 2-5 | Radial nerve (deep branch) | Extends MCP & IP joints of digits 2-5, extends wrist |
| | Extensor Digiti Minimi | Lateral epicondyle of humerus | Extensor expansion of digit 5 | Radial nerve (deep branch) | Extends little finger |
| | Extensor Carpi Ulnaris | Lateral epicondyle of humerus, posterior border of ulna | Base of metacarpal V | Radial nerve (deep branch) | Extends and adducts wrist |
| | Anconeus | Lateral epicondyle of humerus | Olecranon & posterior surface of ulna | Radial nerve | Assists in elbow extension, stabilizes elbow |
| **Deep** | Supinator | Lateral epicondyle of humerus, radial collateral ligament, annular ligament, supinator crest of ulna | Proximal radius | Radial nerve (deep branch) | Supinates forearm |
| | Abductor Pollicis Longus | Posterior surfaces of ulna, radius, & interosseous membrane | Base of metacarpal I | Radial nerve (posterior interosseous branch) | Abducts and extends thumb at CMC joint |
| | Extensor Pollicis Brevis | Posterior surface of radius & interosseous membrane | Proximal phalanx of thumb | Radial nerve (posterior interosseous branch) | Extends thumb at MCP joint |
| | Extensor Pollicis Longus | Posterior surface of ulna & interosseous membrane | Distal phalanx of thumb | Radial nerve (posterior interosseous branch) | Extends thumb at IP, MCP, & CMC joints |
| | Extensor Indicis | Posterior surface of ulna & interosseous membrane | Extensor expansion of index finger | Radial nerve (posterior interosseous branch) | Extends index finger |

## References

1. Kenhub. Elbow and forearm: Forearm muscles and bones anatomy. Available at: https://www.kenhub.com/en/library/anatomy/elbow-and-forearm
2. TeachMeAnatomy. Muscles of the Anterior Forearm. Available at: https://teachmeanatomy.info/upper-limb/muscles/anterior-forearm/
3. TeachMeAnatomy. Muscles of the Posterior Forearm. Available at: https://teachmeanatomy.info/upper-limb/muscles/posterior-forearm/
4. NCBI. Anatomy, Shoulder and Upper Limb, Forearm Nerves. Available at: https://www.ncbi.nlm.nih.gov/books/NBK554514/`
        },
        {
          id: 'hand-aspects',
          name: 'Hand (Palmar and Dorsal Aspects)',
          description: 'Hand anatomy and muscles'
        },
        {
          id: 'cutaneous-innervation',
          name: 'Cutaneous Innervation',
          description: 'Sensory nerve supply to the skin of the upper limb',
          content: `# Upper Limb Anatomy: Cutaneous Innervation

## 1. Overview

The cutaneous innervation of the upper limbs refers to the intricate network of nerves responsible for providing sensory supply to the skin of the arm, forearm, and hand. This sensory information, including touch, temperature, pain, and pressure, is crucial for our interaction with the environment and for protecting the limb from injury. The primary source of these nerves is the brachial plexus, a complex arrangement of nerve fibers originating from the ventral rami of spinal nerves C5 to T1. While the general patterns of cutaneous innervation are well-established and largely consistent across individuals, minor variations can occur. Understanding this innervation is fundamental for diagnosing neurological conditions, localizing nerve injuries, and performing regional anesthesia in clinical practice.

## 2. Location & Anatomy

The cutaneous innervation of the upper limb is derived primarily from the brachial plexus, a complex network formed by the anterior rami of spinal nerves C5, C6, C7, C8, and T1. Additionally, some innervation to the shoulder region comes from the supraclavicular nerves, which originate from the cervical plexus (C3-C4). The nerves emerge from the brachial plexus and its branches to supply distinct areas of the skin, forming a mosaic of sensory territories. These territories are often depicted as dermatomes, which represent the area of skin supplied by a single spinal nerve, and peripheral nerve fields, which are supplied by specific named peripheral nerves.

### Major Cutaneous Nerves and their Distribution:

**Shoulder and Arm:**

*   **Supraclavicular Nerves (C3-C4):** These nerves, originating from the cervical plexus, supply the skin over the clavicle, shoulder, and upper pectoral region. They are responsible for sensation in the superior aspect of the shoulder.
*   **Axillary Nerve (C5, C6):** A terminal branch of the posterior cord of the brachial plexus, the axillary nerve gives rise to the superior lateral cutaneous nerve of the arm. This nerve innervates the skin over the lower part of the deltoid muscle, often referred to as the "regimental badge" area.
*   **Medial Cutaneous Nerve of Arm (C8, T1):** This nerve, a direct branch of the medial cord of the brachial plexus, supplies the skin on the medial side of the arm from the axilla to the elbow.
*   **Posterior Cutaneous Nerve of Arm (C5-C8):** A branch of the radial nerve, it supplies the skin on the posterior aspect of the arm.
*   **Intercostobrachial Nerve (T2):** This nerve is a lateral cutaneous branch of the second intercostal nerve. It supplies the skin of the axilla and the medial side of the upper arm, often communicating with the medial cutaneous nerve of the arm.

**Forearm:**

*   **Lateral Cutaneous Nerve of Forearm (C5, C6, C7):** This is the terminal sensory branch of the musculocutaneous nerve. It supplies the skin on the lateral aspect of the forearm from the elbow to the wrist.
*   **Medial Cutaneous Nerve of Forearm (C8, T1):** A branch of the medial cord of the brachial plexus, it supplies the skin on the medial side of the forearm, extending to the wrist.
*   **Posterior Cutaneous Nerve of Forearm (C5-C8):** A branch of the radial nerve, it supplies the skin on the posterior aspect of the forearm.

**Hand:**

*   **Median Nerve (C6, C7, C8, T1):** The median nerve provides cutaneous innervation to the palmar aspect of the lateral three and a half digits (thumb, index, middle, and lateral half of the ring finger) and the corresponding palm. It also supplies the dorsal tips of these digits.
*   **Ulnar Nerve (C8, T1):** The ulnar nerve supplies the palmar and dorsal aspects of the medial one and a half digits (little finger and medial half of the ring finger) and the corresponding medial part of the palm and dorsum of the hand.
*   **Radial Nerve (C6, C7, C8):** The superficial branch of the radial nerve provides cutaneous innervation to the dorsal aspect of the lateral two and a half digits (thumb, index, and lateral half of the middle finger) and the radial side of the dorsum of the hand, excluding the nail beds.

These nerves, while having distinct primary territories, often have overlapping areas of supply, providing a degree of redundancy in sensory perception. This overlap is clinically significant as it means that damage to a single nerve may not result in complete sensory loss in its entire anatomical distribution.

## 3. Structure & Relations

The cutaneous nerves of the upper limb, while ultimately responsible for superficial sensation, are intimately related to deeper structures, including muscles, bones, and major neurovascular bundles. Their course often follows the paths of larger vessels and motor nerves, making them vulnerable to injury in specific anatomical locations.

### Brachial Plexus and its Branches:

The brachial plexus, the origin of most upper limb nerves, is formed by the ventral rami of C5-T1 spinal nerves. It passes through the neck and axilla, where its trunks, divisions, and cords give rise to the major peripheral nerves. The cutaneous branches often arise from these main nerves or directly from the cords of the plexus.

*   **Roots (C5-T1):** Emerge between the anterior and middle scalene muscles.
*   **Trunks (Superior, Middle, Inferior):** Formed in the posterior triangle of the neck.
*   **Divisions (Anterior, Posterior):** Located behind the clavicle.
*   **Cords (Lateral, Posterior, Medial):** Named according to their relationship with the axillary artery in the axilla.

### Key Anatomical Relations of Cutaneous Nerves:

*   **Axillary Nerve:** After originating from the posterior cord of the brachial plexus, it winds around the surgical neck of the humerus in close proximity to the circumflex humeral arteries. This makes it susceptible to injury in shoulder dislocations or fractures of the humeral neck. Its cutaneous branch, the superior lateral cutaneous nerve of the arm, emerges from beneath the deltoid muscle.

*   **Musculocutaneous Nerve:** Arises from the lateral cord of the brachial plexus. It pierces the coracobrachialis muscle and then descends between the biceps brachii and brachialis muscles. Its terminal cutaneous branch, the lateral cutaneous nerve of the forearm, emerges lateral to the biceps tendon at the elbow, making it vulnerable during venipuncture in the cubital fossa.

*   **Median Nerve:** Formed by contributions from the lateral and medial cords of the brachial plexus, it descends through the arm alongside the brachial artery. In the forearm, it passes between the two heads of pronator teres and then lies deep to the flexor digitorum superficialis. Its palmar cutaneous branch arises in the forearm and travels superficially to the flexor retinaculum, providing sensation to the central palm.

*   **Radial Nerve:** The largest branch of the brachial plexus, it arises from the posterior cord. It spirals around the posterior aspect of the humerus in the radial groove, accompanied by the profunda brachii artery. Here, it is vulnerable to injury in humeral shaft fractures. In the forearm, it divides into a deep motor branch and a superficial sensory branch. The superficial radial nerve descends under the brachioradialis muscle and emerges subcutaneously in the distal forearm to supply the dorsum of the hand.

*   **Ulnar Nerve:** Arises from the medial cord of the brachial plexus. In the arm, it descends medially and then passes posterior to the medial epicondyle of the humerus, where it is commonly palpable (the "funny bone"). This superficial course makes it susceptible to compression or trauma at the elbow. In the forearm, it runs with the ulnar artery. Its dorsal cutaneous branch typically arises in the mid-forearm and supplies the dorsum of the hand and medial digits.

*   **Medial Cutaneous Nerve of Arm and Forearm:** These nerves run superficially along the medial aspect of the arm and forearm, respectively, making them less protected by muscle and bone and thus more exposed to superficial trauma.

Understanding these structural relationships is vital for clinicians to predict the sensory deficits that may arise from injuries at different levels of the upper limb, from the brachial plexus itself to the distal branches in the hand.

## 4. Function

The primary function of the cutaneous innervation of the upper limb is to provide sensory feedback from the skin to the central nervous system. This sensory information is essential for a multitude of daily activities, enabling us to interact effectively and safely with our environment. The skin, being the largest organ, is richly supplied with various types of sensory receptors that detect different stimuli.

### Types of Sensation:

*   **Touch (Tactile Sensation):** This includes light touch, discriminative touch (the ability to distinguish between two closely spaced points), and pressure. Receptors such as Meissner's corpuscles (light touch, discriminative touch), Merkel cells (pressure, texture), and Pacinian corpuscles (deep pressure, vibration) are responsible for these sensations. Precise tactile feedback from the fingertips, mediated largely by the median nerve, is critical for fine motor skills and manipulation of objects.

*   **Temperature Sensation:** Thermoreceptors in the skin detect changes in temperature, allowing us to perceive hot and cold. This is vital for preventing burns or frostbite and for maintaining body temperature homeostasis.

*   **Pain (Nociception):** Free nerve endings in the skin are responsible for detecting noxious stimuli that can cause tissue damage. This pain sensation serves as a protective mechanism, prompting withdrawal from harmful stimuli. Different types of pain, such as sharp, dull, burning, or aching, are conveyed by different nerve fibers.

*   **Proprioception (Conscious and Unconscious):** While primarily associated with muscles, tendons, and joints, cutaneous receptors, particularly those around joints, contribute to proprioception by providing information about skin stretch and tension, which aids in sensing limb position and movement.

### Importance of Cutaneous Sensation:

*   **Protection:** The ability to feel pain, temperature extremes, and pressure protects the limb from injury. For instance, the withdrawal reflex in response to a hot object is a direct result of rapid pain and temperature sensation.

*   **Fine Motor Control and Dexterity:** The rich innervation of the hand, especially the fingertips, allows for highly discriminative touch, which is indispensable for tasks requiring precision, such as writing, buttoning clothes, or playing musical instruments. The median nerve plays a crucial role in this aspect.

*   **Grip and Manipulation:** Sensory feedback from the skin of the palm and fingers informs the brain about the texture, shape, and slipperiness of objects, allowing for appropriate grip strength and manipulation. Without this feedback, tasks like holding a glass of water would be significantly impaired.

*   **Exploration and Learning:** Through touch, infants and children explore their environment, learning about the properties of objects. This sensory input continues to be a vital part of learning and interaction throughout life.

*   **Social Interaction:** Touch is a fundamental aspect of human social interaction, conveying comfort, empathy, and connection.

Damage to cutaneous nerves can lead to sensory deficits, such as numbness (anesthesia), altered sensation (paresthesia), or increased sensitivity (hyperesthesia), significantly impacting a person's ability to perform daily activities and their quality of life. Therefore, understanding the functional roles of these nerves is paramount in clinical assessment and rehabilitation.

## 5. Innervation & Blood Supply

### Innervation (Reiteration and Summary):

As detailed in the 'Location & Anatomy' section, the cutaneous innervation of the upper limb is primarily derived from the brachial plexus (C5-T1), with contributions from the cervical plexus (supraclavicular nerves, C3-C4) and the intercostobrachial nerve (T2). Each major peripheral nerve (axillary, musculocutaneous, median, radial, ulnar) supplies a distinct cutaneous territory, though some overlap exists. This intricate neural network ensures comprehensive sensory coverage of the entire upper limb, enabling the perception of various stimuli.

### Blood Supply to the Skin of the Upper Limb:

The skin of the upper limb, like all living tissues, requires a rich blood supply to maintain its viability and function. This supply is provided by a complex arterial network that originates from the subclavian artery and its branches, ultimately forming a dense capillary bed within the dermis. The major arteries of the upper limb give off numerous cutaneous branches that pierce the deep fascia to supply the overlying skin and subcutaneous tissue.

**Major Arteries and their Cutaneous Contributions:**

*   **Subclavian Artery:** The origin of the arterial supply to the upper limb. On the right side, it arises from the brachiocephalic trunk, and on the left, directly from the aorta.

*   **Axillary Artery:** A continuation of the subclavian artery, it gives off several branches in the axilla, including the superior and inferior lateral thoracic arteries, subscapular artery, and anterior and posterior circumflex humeral arteries. Branches from these vessels contribute to the blood supply of the skin around the shoulder and upper arm.

*   **Brachial Artery:** The main artery of the arm, continuing from the axillary artery. It runs with the median nerve and gives off the profunda brachii artery (deep brachial artery) and several muscular branches. The profunda brachii artery supplies the posterior compartment of the arm and gives rise to branches that supply the overlying skin. Other direct cutaneous branches from the brachial artery also supply the skin of the arm.

*   **Radial Artery:** One of the two terminal branches of the brachial artery in the forearm. It descends along the lateral side of the forearm and gives off numerous small branches that supply the skin of the lateral forearm and wrist. In the hand, it primarily contributes to the deep palmar arch but also gives off dorsal carpal and dorsal digital branches that supply the skin on the dorsum of the hand and digits.

*   **Ulnar Artery:** The other terminal branch of the brachial artery, descending along the medial side of the forearm. It gives off the common interosseous artery, which further divides into anterior and posterior interosseous arteries. Both the ulnar artery and its interosseous branches provide numerous cutaneous perforators that supply the skin of the medial forearm and wrist. In the hand, it forms the superficial palmar arch and gives off palmar digital branches that supply the skin of the palm and medial digits.

**Venous Drainage:**

The venous drainage of the skin of the upper limb largely mirrors the arterial supply, with superficial veins playing a significant role. The **cephalic vein** runs along the lateral aspect of the arm and forearm, while the **basilic vein** runs along the medial aspect. These superficial veins are visible through the skin and are commonly used for venipuncture. They eventually drain into deeper veins, such as the axillary vein, which then drains into the subclavian vein.

This dual system of innervation and blood supply ensures that the skin of the upper limb is not only capable of intricate sensory perception but also receives the necessary nutrients and oxygen to maintain its integrity and function.

## 6. Clinical Relevance

Understanding the cutaneous innervation of the upper limb is of paramount importance in clinical medicine, particularly in neurology, orthopedics, and emergency medicine. Knowledge of the precise sensory territories of individual nerves and dermatomes allows clinicians to accurately diagnose, localize, and manage various conditions affecting the peripheral nervous system.

### Nerve Injuries and Lesions:

*   **Sensory Deficits:** Damage to a peripheral nerve or a spinal nerve root can result in characteristic patterns of sensory loss (anesthesia or hypesthesia), altered sensation (paresthesia, dysesthesia), or pain (neuropathic pain) in the corresponding cutaneous distribution. For example, a complete transection of the median nerve at the wrist would lead to sensory loss over the palmar aspect of the lateral three and a half digits and the central palm, but not the dorsal aspect of the hand, which is supplied by the radial and ulnar nerves.

*   **Common Nerve Entrapments/Injuries:**
    *   **Axillary Nerve:** Vulnerable in shoulder dislocations or fractures of the surgical neck of the humerus. Sensory loss occurs over the "regimental badge" area.
    *   **Musculocutaneous Nerve:** Can be injured by deep penetrating wounds in the arm or during vigorous muscle contraction. Sensory loss affects the lateral forearm.
    *   **Median Nerve:** Commonly compressed in the carpal tunnel (carpal tunnel syndrome), leading to sensory symptoms in the thumb, index, middle, and lateral half of the ring finger. The palmar cutaneous branch, which arises proximal to the carpal tunnel, is typically spared, meaning sensation in the central palm remains intact.
    *   **Radial Nerve:** Susceptible to injury in humeral shaft fractures (saturday night palsy) or compression in the axilla (crutch palsy). Sensory deficits occur over the posterior arm, forearm, and dorsum of the hand (excluding the fingertips).
    *   **Ulnar Nerve:** Frequently compressed at the elbow (cubital tunnel syndrome) or wrist (Guyon's canal syndrome). Sensory loss is observed in the little finger and medial half of the ring finger, and the medial part of the palm and dorsum of the hand.

### Dermatome Testing:

*   **Spinal Cord Lesions:** Dermatome maps are crucial for localizing lesions within the spinal cord or spinal nerve roots. Each dermatome represents the area of skin supplied by sensory fibers from a single spinal nerve segment. For example, sensory loss in the C6 dermatome (thumb and radial forearm) suggests a lesion affecting the C6 spinal nerve root.
*   **Distinguishing Nerve vs. Root Lesions:** By comparing sensory deficits in peripheral nerve distributions versus dermatomal patterns, clinicians can differentiate between peripheral nerve injuries and spinal nerve root compressions (radiculopathies).

### Regional Anesthesia:

*   **Nerve Blocks:** Knowledge of cutaneous innervation is fundamental for performing regional anesthetic blocks. Anesthesiologists target specific nerves (e.g., brachial plexus block, median nerve block, ulnar nerve block) to achieve sensory and motor blockade in a defined area for surgical procedures or pain management. Accurate anatomical understanding ensures effective and safe administration of local anesthetics.

### Referred Pain:

*   Visceral pain can sometimes be referred to cutaneous areas innervated by the same spinal segments. For instance, cardiac pain (angina) can be referred to the medial aspect of the left arm, which is innervated by T1-T2 spinal segments, reflecting the shared sympathetic innervation.

In summary, a thorough understanding of the cutaneous innervation of the upper limb is not merely an academic exercise but a practical necessity for accurate diagnosis, effective treatment, and improved patient outcomes in a wide range of clinical scenarios.

## 7. Mnemonics

Mnemonics are valuable tools for memorizing complex anatomical information, such as the components of the brachial plexus and the terminal branches responsible for cutaneous innervation. Here are some commonly used mnemonics:

### Brachial Plexus Components (Roots, Trunks, Divisions, Cords, Branches):

*   **R**ead **T**hat **D**amn **C**adaver **B**ook:
    *   **R**oots (C5-T1)
    *   **T**runks (Superior, Middle, Inferior)
    *   **D**ivisions (Anterior, Posterior)
    *   **C**ords (Lateral, Posterior, Medial)
    *   **B**ranches (Terminal branches)

### Terminal Branches of the Brachial Plexus:

These are the five main nerves that arise from the brachial plexus and are responsible for the motor and sensory innervation of the upper limb, including its cutaneous supply.

*   **M**y **A**unt **R**arely **M**akes **U**ncle **M**oney (or **M**ost **A**lcoholics **M**ust **R**eally **U**rinate):
    *   **M**usculocutaneous nerve
    *   **A**xillary nerve
    *   **R**adial nerve
    *   **M**edian nerve
    *   **U**lnar nerve

### Cutaneous Innervation of the Hand (Simplified):

While not a single mnemonic, remembering the general distribution can be aided by visualizing the hand:

*   **Median Nerve:** "Median nerve, median hand" - supplies the palmar aspect of the thumb, index, middle, and lateral half of the ring finger, and their dorsal tips.
*   **Ulnar Nerve:** "Ulnar nerve, pinky side" - supplies the palmar and dorsal aspects of the little finger and medial half of the ring finger.
*   **Radial Nerve (Superficial Branch):** "Radial nerve, dorsal thumb side" - supplies the dorsal aspect of the thumb, index, and lateral half of the middle finger (excluding nail beds).

These mnemonics can serve as quick recall aids during study and in clinical settings.

## 8. Summary Table / Cheat Sheet

This table provides a concise summary of the major cutaneous nerves of the upper limb, their spinal root origins, and their primary areas of sensory innervation.

| Nerve | Spinal Roots | Area of Cutaneous Innervation |
| :--- | :--- | :--- |
| **Supraclavicular Nerves** | C3, C4 | Skin over clavicle, shoulder, and upper pectoral region |
| **Axillary Nerve** | C5, C6 | Skin over lower deltoid ("regimental badge" area) |
| **Medial Cutaneous Nerve of Arm** | C8, T1 | Medial aspect of arm |
| **Posterior Cutaneous Nerve of Arm** | C5-C8 | Posterior aspect of arm |
| **Intercostobrachial Nerve** | T2 | Axilla and medial aspect of upper arm |
| **Lateral Cutaneous Nerve of Forearm** | C5, C6, C7 | Lateral aspect of forearm |
| **Medial Cutaneous Nerve of Forearm** | C8, T1 | Medial aspect of forearm |
| **Posterior Cutaneous Nerve of Forearm** | C5-C8 | Posterior aspect of forearm |
| **Median Nerve** | C6-T1 | Palmar aspect of lateral 3.5 digits and palm; dorsal tips of same digits |
| **Ulnar Nerve** | C8, T1 | Palmar and dorsal aspects of medial 1.5 digits and medial hand |
| **Radial Nerve (Superficial Branch)** | C6-C8 | Dorsal aspect of lateral 2.5 digits and radial hand (excluding nail beds) |`
        },
        {
          id: 'upper-limb-vessels',
          name: 'Arteries, Veins, and Lymphatics',
          description: 'Upper limb circulation',
          content: `# Upper Limb Anatomy: Arteries, Veins, and Lymphatics

## 1. Overview

The vascular and lymphatic systems of the upper limb are intricate networks essential for its function, providing oxygen and nutrients, removing waste products, and contributing to immune surveillance. This comprehensive overview synthesizes information from leading anatomical texts to provide a detailed understanding of the arteries, veins, and lymphatics of the upper limb, emphasizing their anatomical course, relationships, functions, and clinical significance.

### Arteries

The arterial supply to the upper limb originates from the subclavian artery, which transitions into the axillary, brachial, radial, and ulnar arteries. These major vessels, along with their numerous branches, ensure a rich and redundant blood supply to the shoulder, arm, forearm, and hand. Anastomotic networks, particularly around the scapula and elbow, provide collateral circulation, safeguarding against ischemia in case of vessel occlusion.

### Veins

The venous drainage of the upper limb comprises both superficial and deep systems. The superficial veins, including the cephalic and basilic veins, are readily accessible and clinically important for venepuncture. The deep veins generally accompany the arteries, often as venae comitantes, and eventually drain into the axillary and subclavian veins, returning deoxygenated blood to the systemic circulation. Perforating veins connect the superficial and deep systems, allowing for blood flow redistribution.

### Lymphatics

The lymphatic system of the upper limb plays a crucial role in fluid balance and immune defense. Lymphatic vessels, both superficial and deep, collect interstitial fluid and transport it to regional lymph nodes, primarily the axillary lymph nodes. These nodes filter lymph, house immune cells, and are vital in the diagnosis and staging of various diseases, particularly cancers affecting the upper limb and breast.

## 2. Location & Anatomy

### Arteries

#### Subclavian Artery

**Origin:**
*   **Right:** Arises from the brachiocephalic trunk, behind the right sternoclavicular joint.
*   **Left:** Arises directly from the arch of the aorta, in the thorax.

**Course:**
It arches over the first rib, passing between the anterior and middle scalene muscles. It is divided into three parts by the anterior scalene muscle:
*   **First part (pre-scalene):** From its origin to the medial border of the anterior scalene muscle. It gives off the vertebral artery, internal thoracic artery, and thyrocervical trunk.
*   **Second part (retro-scalene):** Lies posterior to the anterior scalene muscle. It gives off the costocervical trunk.
*   **Third part (post-scalene):** From the lateral border of the anterior scalene muscle to the lateral border of the first rib. It typically has no branches but may give off the dorsal scapular artery.

**Termination:** At the lateral border of the first rib, it becomes the axillary artery.

#### Axillary Artery

**Origin:** Continuation of the subclavian artery at the lateral border of the first rib.

**Course:** Extends through the axilla, enclosed within the axillary sheath along with the brachial plexus cords and axillary vein. It is divided into three parts by the pectoralis minor muscle:
*   **First part (proximal to pectoralis minor):** Gives off the superior thoracic artery.
*   **Second part (posterior to pectoralis minor):** Gives off the thoracoacromial artery and lateral thoracic artery.
*   **Third part (distal to pectoralis minor):** Gives off the subscapular artery, anterior circumflex humeral artery, and posterior circumflex humeral artery.

**Termination:** At the inferior border of the teres major muscle, it becomes the brachial artery.

#### Brachial Artery

**Origin:** Continuation of the axillary artery at the inferior border of the teres major muscle.

**Course:** Descends down the medial aspect of the arm, superficial to the brachialis muscle. It is accompanied by the median nerve, which crosses anterior to it from lateral to medial. In the cubital fossa, it lies deep to the bicipital aponeurosis.

**Branches:**
*   **Profunda brachii artery (deep brachial artery):** Largest branch, accompanies the radial nerve in the radial groove, supplying the triceps brachii and contributing to the elbow anastomosis.
*   **Superior ulnar collateral artery:** Accompanies the ulnar nerve.
*   **Inferior ulnar collateral artery.**
*   **Nutrient arteries to the humerus.**

**Termination:** In the cubital fossa, at the level of the neck of the radius, it bifurcates into the radial and ulnar arteries.

#### Radial Artery

**Origin:** Bifurcation of the brachial artery in the cubital fossa.

**Course:** Descends along the lateral side of the forearm, lying on the supinator, pronator teres, flexor digitorum superficialis, and flexor pollicis longus muscles. In the distal forearm, it lies superficial to the radius, between the tendons of brachioradialis and flexor carpi radialis, where its pulse can be palpated. It then winds around the lateral aspect of the wrist to enter the anatomical snuffbox.

**Branches:** Radial recurrent artery, muscular branches, palmar carpal branch, dorsal carpal branch, superficial palmar branch, first dorsal metacarpal artery, princeps pollicis artery, radialis indicis artery.

**Termination:** Enters the palm by passing between the two heads of the first dorsal interosseous muscle to form the deep palmar arch.

#### Ulnar Artery

**Origin:** Bifurcation of the brachial artery in the cubital fossa.

**Course:** Descends along the medial side of the forearm, deep to the pronator teres and flexor carpi ulnaris. It is accompanied by the ulnar nerve in its distal two-thirds. It enters the hand superficial to the flexor retinaculum, lateral to the ulnar nerve and pisiform bone.

**Branches:** Anterior ulnar recurrent artery, posterior ulnar recurrent artery, common interosseous artery (which divides into anterior and posterior interosseous arteries), muscular branches, palmar carpal branch, dorsal carpal branch, deep palmar branch.

**Termination:** Enters the palm to form the superficial palmar arch.

#### Palmar Arches (Hand)

*   **Superficial Palmar Arch:** Primarily formed by the ulnar artery, with a contribution from the superficial palmar branch of the radial artery. It gives rise to common palmar digital arteries, which then divide into proper palmar digital arteries supplying the fingers.
*   **Deep Palmar Arch:** Primarily formed by the radial artery, with a contribution from the deep palmar branch of the ulnar artery. It gives rise to palmar metacarpal arteries and recurrent branches to the wrist joint.

### Veins

The venous system of the upper limb is divided into superficial and deep veins, which largely follow the arterial pathways.

#### Superficial Veins

These veins lie in the subcutaneous tissue and are clinically significant for venepuncture.

*   **Dorsal Venous Network of the Hand:** A prominent network on the dorsum of the hand, formed by the dorsal digital veins and dorsal metacarpal veins. It is the origin of the cephalic and basilic veins.

*   **Cephalic Vein:**
    *   **Origin:** Lateral side of the dorsal venous network of the hand.
    *   **Course:** Ascends along the lateral aspect of the forearm and arm. In the arm, it runs in the deltopectoral groove (between the deltoid and pectoralis major muscles).
    *   **Termination:** Pierces the clavipectoral fascia to drain into the axillary vein.

*   **Basilic Vein:**
    *   **Origin:** Medial side of the dorsal venous network of the hand.
    *   **Course:** Ascends along the medial aspect of the forearm and arm. In the middle of the arm, it pierces the deep fascia to join the deep veins.
    *   **Termination:** Joins the brachial veins to form the axillary vein at the inferior border of the teres major muscle.

*   **Median Cubital Vein:**
    *   **Location:** Connects the cephalic and basilic veins in the cubital fossa (anterior to the elbow joint).
    *   **Clinical Significance:** A common site for venepuncture due to its superficial position and relative stability.

*   **Median Antebrachial Vein (Median Vein of Forearm):**
    *   **Origin:** Palmar venous network of the hand.
    *   **Course:** Ascends on the anterior aspect of the forearm.
    *   **Termination:** May drain into the basilic vein, cephalic vein, or median cubital vein.

#### Deep Veins

These veins accompany the major arteries and are typically paired (venae comitantes).

*   **Palmar Digital Veins:** Accompany the palmar digital arteries.
*   **Palmar Metacarpal Veins:** Accompany the palmar metacarpal arteries.
*   **Deep Palmar Venous Arch:** Accompanies the deep palmar arterial arch.
*   **Radial Veins:** Paired veins accompanying the radial artery in the forearm.
*   **Ulnar Veins:** Paired veins accompanying the ulnar artery in the forearm.
*   **Brachial Veins:** Paired veins accompanying the brachial artery in the arm. They are formed by the union of the radial and ulnar veins in the cubital fossa.
*   **Axillary Vein:**
    *   **Origin:** Formed by the union of the basilic vein and the brachial veins at the inferior border of the teres major muscle.
    *   **Course:** Accompanies the axillary artery through the axilla.
    *   **Termination:** At the lateral border of the first rib, it becomes the subclavian vein.

*   **Subclavian Vein:**
    *   **Origin:** Continuation of the axillary vein at the lateral border of the first rib.
    *   **Course:** Passes medially, anterior to the anterior scalene muscle.
    *   **Termination:** Joins the internal jugular vein to form the brachiocephalic vein.

### Lymphatics

The lymphatic drainage of the upper limb follows a general pattern, with superficial vessels draining the skin and subcutaneous tissue, and deep vessels draining muscles, bones, and joints. All lymphatic vessels eventually drain into regional lymph nodes, primarily the axillary lymph nodes.

#### Lymphatic Vessels

*   **Superficial Lymphatic Vessels:** Originate from lymphatic plexuses in the skin and subcutaneous tissue of the hand and digits. They generally follow the superficial veins (cephalic and basilic veins) and drain into the superficial cubital (supratrochlear) lymph nodes and then into the axillary lymph nodes.

*   **Deep Lymphatic Vessels:** Accompany the deep arteries and veins of the upper limb. They drain lymph from muscles, bones, joints, and nerves. These vessels drain directly into the axillary lymph nodes or into small, inconstant deep lymph nodes along the course of the brachial and axillary vessels.

#### Lymph Nodes

*   **Superficial Cubital (Supratrochlear) Lymph Nodes:** Located just above the medial epicondyle of the humerus, along the basilic vein. They receive lymph from the medial side of the hand and forearm.

*   **Deltopectoral Lymph Nodes:** Located along the cephalic vein in the deltopectoral groove. They receive lymph from the lateral part of the hand, forearm, and arm.

*   **Axillary Lymph Nodes:** These are the most important regional lymph nodes for the upper limb and breast. They are typically divided into five main groups based on their location within the axilla:
    *   **Anterior (Pectoral) Nodes:** Lie along the lateral thoracic vessels, receiving lymph primarily from the breast and anterior thoracic wall.
    *   **Posterior (Subscapular) Nodes:** Lie along the subscapular vessels, receiving lymph from the posterior thoracic wall and scapular region.
    *   **Lateral (Humeral) Nodes:** Lie along the medial side of the axillary vein, receiving most of the lymph from the upper limb.
    *   **Central Nodes:** Located in the fat of the axilla, receiving lymph from the anterior, posterior, and lateral groups.
    *   **Apical (Subclavian) Nodes:** Located at the apex of the axilla, receiving lymph from all other axillary groups and directly from some parts of the breast. Efferent vessels from the apical nodes form the subclavian lymphatic trunk.

*   **Subclavian Lymphatic Trunk:** Formed by the efferent vessels from the apical axillary nodes. On the right side, it may join the right jugular and bronchomediastinal trunks to form the right lymphatic duct, or it may drain directly into the right subclavian vein. On the left side, it usually drains into the thoracic duct.

*   **Thoracic Duct:** The largest lymphatic vessel in the body, draining lymph from the left upper limb, left side of the head and neck, left thorax, and all parts of the body below the diaphragm. It empties into the junction of the left internal jugular and left subclavian veins.

*   **Right Lymphatic Duct:** A short vessel that drains lymph from the right upper limb, right side of the head and neck, and right thorax. It empties into the junction of the right internal jugular and right subclavian veins.

## 3. Function

### Arteries

The primary function of the arteries in the upper limb is to deliver oxygenated blood and nutrients from the heart to the various tissues, muscles, bones, and organs of the upper extremity. This continuous supply is vital for cellular metabolism, muscle contraction, nerve conduction, and overall tissue viability. The branching pattern and anastomotic connections ensure a robust and redundant blood supply, minimizing the risk of ischemia even with partial occlusion of a major vessel.

### Veins

The veins of the upper limb are responsible for returning deoxygenated blood and metabolic waste products from the tissues back to the heart. The superficial veins play a significant role in thermoregulation and are commonly used for venepuncture and intravenous access. The deep veins, often paired with arteries (venae comitantes), benefit from the pulsations of the accompanying arteries, which aid in venous return. Valves within the veins prevent the backflow of blood, ensuring unidirectional flow towards the heart.

### Lymphatics

The lymphatic system of the upper limb performs several critical functions:

*   **Fluid Balance:** It collects excess interstitial fluid, proteins, and cellular debris from the extracellular spaces and returns them to the bloodstream, thereby maintaining fluid homeostasis and preventing edema.
*   **Immune Surveillance:** Lymph nodes act as filters, trapping foreign particles, pathogens, and cancer cells. They are sites where immune cells (lymphocytes) proliferate and mount immune responses against infections and diseases.
*   **Fat Absorption:** Although less prominent in the upper limb, lymphatic vessels in other parts of the body (lacteals in the small intestine) are involved in the absorption and transport of dietary fats.
*   **Waste Removal:** Lymphatic vessels transport waste products and toxins away from the tissues.

## 4. Clinical Relevance

### Arteries

#### **Peripheral Artery Disease (PAD)**

*   **Description:** Atherosclerosis can affect the arteries of the upper limb, though less common than in the lower limbs. It leads to narrowing of the arteries, reducing blood flow.
*   **Clinical Manifestations:** Pain, numbness, weakness, or coldness in the affected arm or hand, especially during exercise (claudication). In severe cases, non-healing ulcers or gangrene.
*   **Diagnosis:** Ankle-brachial index (ABI) is less useful; often diagnosed by brachial-brachial index or imaging (Doppler ultrasound, CT angiography, MRA).

#### **Thoracic Outlet Syndrome (TOS)**

*   **Description:** Compression of the neurovascular structures (brachial plexus, subclavian artery, and subclavian vein) as they pass through the thoracic outlet (space between the clavicle and first rib).
*   **Arterial TOS:** Compression of the subclavian artery can lead to arm pain, pallor, coldness, and diminished pulses. It can also cause post-stenotic dilation and aneurysm formation, with potential for distal embolization.

#### **Aneurysms**

*   **Axillary Artery Aneurysm:** Rare, but can occur due to trauma or repetitive microtrauma (e.g., in athletes). Dilation of the artery can compress the brachial plexus, causing neurological symptoms (paraesthesia, weakness). Risk of thrombosis and distal embolization.

#### **Trauma and Lacerations**

*   **Brachial Artery Laceration:** Common in supracondylar fractures of the humerus in children. Can lead to acute limb ischemia. If untreated, can result in Volkmann's ischemic contracture (flexion deformity of the hand and wrist due to muscle necrosis and fibrosis).
*   **Radial and Ulnar Artery Injuries:** Can occur due to penetrating trauma. Due to extensive collateral circulation in the hand (palmar arches), isolated injury to one artery may not cause severe ischemia, but combined injury can be limb-threatening.

#### **Arterial Cannulation**

*   **Radial Artery:** Commonly used for arterial blood gas sampling and continuous blood pressure monitoring due to its superficial location and the presence of the ulnar artery collateral supply (Allen's test is performed to confirm adequate collateral flow).

### Veins

#### **Venepuncture and Intravenous Access**

*   **Median Cubital Vein:** The most common site for venepuncture (blood draws) and intravenous cannulation due to its large size, superficial location, and relative stability in the cubital fossa.
*   **Cephalic and Basilic Veins:** Also used for IV access, especially the cephalic vein in the deltopectoral groove for central line insertion (PICC lines).

#### **Deep Vein Thrombosis (DVT) of the Upper Limb**

*   **Description:** Formation of a blood clot in a deep vein of the upper limb, most commonly the axillary or subclavian veins.
*   **Causes:** Can be primary (Paget-Schroetter syndrome, due to repetitive overhead arm activity compressing the subclavian vein) or secondary (due to central venous catheters, malignancy, hypercoagulable states).
*   **Clinical Manifestations:** Swelling, pain, warmth, and discoloration of the arm. Risk of pulmonary embolism, though lower than lower limb DVT.

#### **Superficial Thrombophlebitis**

*   **Description:** Inflammation and thrombosis of a superficial vein, often the basilic or cephalic vein, commonly associated with intravenous cannulation or trauma.
*   **Clinical Manifestations:** Localized pain, redness, tenderness, and a palpable cord along the course of the vein.

### Lymphatics

#### **Lymphedema**

*   **Description:** Chronic swelling of the upper limb due to impaired lymphatic drainage. Can be primary (congenital) or secondary (more common).
*   **Causes of Secondary Lymphedema:** Most commonly caused by axillary lymph node dissection and radiation therapy for breast cancer. Other causes include infection (e.g., filariasis), trauma, or malignancy.
*   **Clinical Manifestations:** Progressive, non-pitting edema, skin thickening, discomfort, and increased risk of infections (e.g., cellulitis).
*   **Management:** Compression therapy, manual lymphatic drainage, exercise, skin care, and in some cases, surgery.

#### **Lymphadenopathy**

*   **Description:** Enlargement of lymph nodes.
*   **Axillary Lymphadenopathy:** Common finding, often indicative of infection in the upper limb or breast. Can also be a sign of metastatic cancer (especially breast cancer or melanoma) or lymphoma. Palpation of axillary lymph nodes is a routine part of clinical examination.

#### **Lymphangitis**

*   **Description:** Inflammation of lymphatic vessels, typically caused by bacterial infection (e.g., Streptococcus pyogenes) entering through a break in the skin.
*   **Clinical Manifestations:** Red streaks extending proximally from the site of infection towards the regional lymph nodes, accompanied by fever, chills, and malaise. Often associated with painful, enlarged regional lymph nodes.

## 5. Mnemonics

### Arteries

1. **Branches of the Axillary Artery (from first to third part):**
   * **S**ome **T**imes **L**overs **P**refer **S**ex **M**ore **O**ften
     * **S**uperior thoracic artery (1st part)
     * **T**horacoacromial artery (2nd part)
     * **L**ateral thoracic artery (2nd part)
     * **S**ubscapular artery (3rd part)
     * **A**nterior circumflex humeral artery (3rd part)
     * **P**osterior circumflex humeral artery (3rd part)

2. **Branches of the Thoracoacromial Artery (Pectoral, Acromial, Clavicular, Deltoid):**
   * **P**ac **A**ll **C**ome **D**eep
     * **P**ectoral branch
     * **A**cromial branch
     * **C**lavicular branch
     * **D**eltoid branch

3. **Order of structures in the Cubital Fossa (Lateral to Medial):**
   * **T**an **A**pple **B**eets **M**ake **N**o **S**ense
     * **T**endon of biceps brachii
     * **A**rtery (brachial artery)
     * **M**edian nerve
     * **R**adial nerve (often not included in this mnemonic as it branches early)

### Veins

1. **Superficial Veins of the Upper Limb:**
   * **C**ephalic **B**asilic **M**edian **C**ubital
     * **C**ephalic vein (lateral)
     * **B**asilic vein (medial)
     * **M**edian **C**ubital vein (connects them in the cubital fossa)

### Lymphatics

1. **Groups of Axillary Lymph Nodes:**
   * **L**arge **P**eople **C**arry **C**entral **A**xillary **N**odes
     * **L**ateral (Humeral)
     * **P**osterior (Subscapular)
     * **C**entral
     * **A**nterior (Pectoral)
     * **A**pical (Subclavian)

## 6. Summary Table / Cheat Sheet

### Arteries of the Upper Limb

| Artery | Origin/Continuation From | Course | Major Branches/Supply | Termination/Continuation To |
|---|---|---|---|---|
| **Subclavian Artery** | Right: Brachiocephalic trunk; Left: Aortic arch | Arches over 1st rib, divided into 3 parts by anterior scalene | Vertebral, Internal Thoracic, Thyrocervical trunk, Costocervical trunk, Dorsal Scapular (variable) | Axillary Artery (at lateral border of 1st rib) |
| **Axillary Artery** | Subclavian Artery | Through axilla, divided into 3 parts by pectoralis minor | Superior Thoracic, Thoracoacromial, Lateral Thoracic, Subscapular, Anterior & Posterior Circumflex Humeral | Brachial Artery (at inferior border of teres major) |
| **Brachial Artery** | Axillary Artery | Medial arm, through cubital fossa | Profunda Brachii, Superior & Inferior Ulnar Collateral, Nutrient | Radial & Ulnar Arteries (in cubital fossa) |
| **Radial Artery** | Brachial Artery | Lateral forearm, winds around wrist | Radial Recurrent, Muscular, Palmar Carpal, Dorsal Carpal, Superficial Palmar, Princeps Pollicis, Radialis Indicis | Deep Palmar Arch (in hand) |
| **Ulnar Artery** | Brachial Artery | Medial forearm, through Guyon's canal | Anterior & Posterior Ulnar Recurrent, Common Interosseous (Ant. & Post. Interosseous), Muscular, Palmar Carpal, Dorsal Carpal, Deep Palmar branch | Superficial Palmar Arch (in hand) |
| **Superficial Palmar Arch** | Ulnar Artery (main) + Superficial Palmar branch of Radial | Anterior to flexor tendons, deep to palmar aponeurosis | Common Palmar Digital Arteries (to Proper Palmar Digital) | Anastomoses with Deep Palmar Arch |
| **Deep Palmar Arch** | Radial Artery (main) + Deep Palmar branch of Ulnar | Deep to flexor tendons, on metacarpals | Palmar Metacarpal Arteries, Recurrent branches | Anastomoses with Superficial Palmar Arch |

### Veins of the Upper Limb

| Vein | Origin/Tributaries From | Course | Termination/Drains Into | Type |
|---|---|---|---|---|
| **Dorsal Venous Network** | Dorsal Digital & Metacarpal Veins | Dorsum of hand | Cephalic & Basilic Veins | Superficial |
| **Cephalic Vein** | Dorsal Venous Network | Lateral forearm & arm, deltopectoral groove | Axillary Vein (pierces clavipectoral fascia) | Superficial |
| **Basilic Vein** | Dorsal Venous Network | Medial forearm & arm, pierces deep fascia mid-arm | Axillary Vein (joins Brachial Veins) | Superficial |
| **Median Cubital Vein** | Connects Cephalic & Basilic Veins | Cubital fossa | Cephalic or Basilic Vein | Superficial |
| **Radial Veins** | Deep Palmar Arch, Palmar Metacarpal Veins | Paired, accompany Radial Artery in forearm | Brachial Veins (in cubital fossa) | Deep (Venae Comitantes) |
| **Ulnar Veins** | Deep Palmar Arch, Palmar Metacarpal Veins | Paired, accompany Ulnar Artery in forearm | Brachial Veins (in cubital fossa) | Deep (Venae Comitantes) |
| **Brachial Veins** | Radial & Ulnar Veins | Paired, accompany Brachial Artery in arm | Axillary Vein (at inferior border of teres major) | Deep (Venae Comitantes) |
| **Axillary Vein** | Basilic Vein + Brachial Veins | Through axilla, accompanies Axillary Artery | Subclavian Vein (at lateral border of 1st rib) | Deep |
| **Subclavian Vein** | Axillary Vein | Medial, anterior to anterior scalene | Brachiocephalic Vein (joins Internal Jugular Vein) | Deep |

### Lymphatics of the Upper Limb

| Structure | Drainage From | Location | Drains Into |
|---|---|---|---|
| **Superficial Lymphatic Vessels** | Skin & subcutaneous tissue of hand & digits | Follow superficial veins (cephalic & basilic) | Superficial Cubital & Axillary Lymph Nodes |
| **Deep Lymphatic Vessels** | Muscles, bones, joints, nerves | Accompany deep arteries & veins | Axillary Lymph Nodes |
| **Superficial Cubital (Supratrochlear) Lymph Nodes** | Medial hand & forearm | Just above medial epicondyle, along basilic vein | Axillary Lymph Nodes |
| **Deltopectoral Lymph Nodes** | Lateral hand, forearm, arm | Along cephalic vein in deltopectoral groove | Axillary Lymph Nodes |
| **Axillary Lymph Nodes** | Entire upper limb, breast, thoracic wall | Axilla (5 groups: Anterior, Posterior, Lateral, Central, Apical) | Subclavian Lymphatic Trunk |
| **Subclavian Lymphatic Trunk** | Apical Axillary Nodes | Neck | Right: Right Lymphatic Duct or Right Subclavian Vein; Left: Thoracic Duct |
| **Right Lymphatic Duct** | Right upper limb, right head/neck/thorax | Right side of neck | Right Internal Jugular & Right Subclavian Vein junction |
| **Thoracic Duct** | Left upper limb, left head/neck/thorax, entire body below diaphragm | Thorax & neck | Left Internal Jugular & Left Subclavian Vein junction |`
        },
        {
          id: 'axilla-anatomy',
          name: 'Detailed Anatomy of the Axilla',
          description: 'Comprehensive anatomy of the axillary region',
          content: `# Detailed Anatomy of the Axilla

## 1. Overview

The axilla, commonly known as the armpit, is a crucial anatomical region that serves as a passageway for neurovascular structures connecting the neck and thorax to the upper limb. This pyramidal-shaped space, located inferior to the glenohumeral (shoulder) joint, is a complex area containing major arteries, veins, nerves, and lymphatic vessels, all embedded within a fatty matrix. Its strategic location makes it highly significant in both normal physiological function and various clinical contexts, including trauma, infection, and oncological conditions.

Understanding the precise boundaries, contents, and relationships within the axilla is fundamental for medical professionals. This knowledge is essential for safe surgical approaches, accurate interpretation of diagnostic imaging, effective management of injuries, and comprehending the spread of diseases, particularly breast cancer. This document aims to provide a comprehensive and detailed exploration of the axilla, drawing upon the authoritative insights from Snell Clinical Anatomy, Gray's Anatomy, and Keith Moore Anatomy.

We will systematically examine the axilla's shape, walls, and apex, followed by a thorough description of its vital contents. Clinical correlates will be integrated throughout to highlight the practical implications of anatomical knowledge, and mnemonics will be provided to aid in memorization. Finally, key diagrams and a summary table will consolidate the information for quick reference and enhanced learning.

## 2. Location & Anatomy

The axilla is a pyramidal space located between the upper part of the arm and the lateral chest wall. It acts as a conduit for the major neurovascular structures that supply the upper limb. Its shape is often described as a four-sided pyramid with an apex, a base, and four walls.

### Shape and Boundaries:

*   **Apex (Cervicoaxillary Canal):** Directed superiorly and medially towards the root of the neck. It is bounded by:
    *   **Anteriorly:** Posterior surface of the clavicle.
    *   **Medially:** Lateral border of the first rib.
    *   **Posteriorly:** Superior border of the scapula (coracoid process).
    *   *Significance:* This is the narrowest part of the axilla, through which all major structures pass.

*   **Base:** Directed inferiorly and laterally, forming the armpit. It is formed by:
    *   **Skin:** The hairy skin of the armpit.
    *   **Subcutaneous Tissue:** Contains sweat glands and hair follicles.
    *   **Axillary Fascia:** A strong fascia that extends from the skin to the deeper structures, forming the floor of the axilla.

*   **Anterior Wall:** Formed by:
    *   **Pectoralis Major Muscle:** The most superficial muscle.
    *   **Pectoralis Minor Muscle:** Located deep to the pectoralis major.
    *   **Clavipectoral Fascia:** A strong fascial sheet enclosing the pectoralis minor and subclavius muscles.

*   **Posterior Wall:** Formed by:
    *   **Subscapularis Muscle:** Covers the anterior surface of the scapula.
    *   **Teres Major Muscle:** Inferior to the subscapularis.
    *   **Latissimus Dorsi Muscle:** The largest muscle of the back, forming the inferior part of the posterior wall.

*   **Medial Wall:** Formed by:
    *   **Upper four or five Ribs:** Covered by the intercostal muscles.
    *   **Serratus Anterior Muscle:** Covers the lateral aspect of the ribs.

*   **Lateral Wall:** Formed by:
    *   **Intertubercular (Bicipital) Groove of the Humerus:** The narrow groove between the greater and lesser tubercles.
    *   **Coracobrachialis Muscle:** Lies anterior to the humerus.
    *   **Biceps Brachii Muscle (short head):** Lies anterior to the humerus.

### General Anatomical Components:

The axilla is filled with loose areolar tissue and fat, which allows for the passage and movement of its vital contents. These contents include:

*   **Axillary Artery and its Branches:** The main arterial supply to the upper limb.
*   **Axillary Vein and its Tributaries:** The main venous drainage from the upper limb.
*   **Brachial Plexus:** A complex network of nerves that innervates the upper limb.
*   **Axillary Lymph Nodes:** A group of lymph nodes crucial for lymphatic drainage from the upper limb, pectoral region, and breast.
*   **Axillary Sheath:** A fascial sleeve derived from the prevertebral fascia, enclosing the axillary artery and the cords of the brachial plexus.

These components are strategically arranged within the axilla, with the axillary artery and its branches generally positioned laterally, the axillary vein medially, and the brachial plexus cords surrounding the artery. The lymph nodes are interspersed throughout the fatty tissue. The precise arrangement and relationships of these structures are critical for understanding their function and clinical significance.

## 3. Structure & Relations

The axilla is a dynamic anatomical space whose contents and boundaries are intimately related to the movements of the upper limb and shoulder girdle. The arrangement of its walls and the structures passing through it are critical for understanding its function and clinical implications.

### Walls and Their Contributions:

*   **Anterior Wall:** Formed by the Pectoralis Major and Pectoralis Minor muscles, and the clavipectoral fascia. The anterior wall forms the anterior axillary fold, which is a prominent landmark.
*   **Posterior Wall:** Formed by the Subscapularis, Teres Major, and Latissimus Dorsi muscles. This wall is robust and forms the posterior axillary fold.
*   **Medial Wall:** Formed by the upper four or five ribs and the intercostal muscles covering them, along with the Serratus Anterior muscle. This wall is convex and provides a stable base for scapular movement.
*   **Lateral Wall:** Formed by the intertubercular groove of the humerus, and the Coracobrachialis and short head of Biceps Brachii muscles. This narrow wall directs the neurovascular structures towards the arm.

### Contents and Their Relationships:

The contents of the axilla are embedded in a matrix of fat and loose connective tissue, allowing for movement and expansion. The key contents are arranged in a specific order, which is vital for understanding their vulnerability and clinical presentation:

1.  **Axillary Artery:** The main arterial supply to the upper limb, it is a continuation of the subclavian artery. The pectoralis minor muscle divides the axillary artery into three parts, which is a crucial anatomical and surgical landmark:
    *   **First Part:** Proximal to Pectoralis Minor. Gives off one branch: Superior Thoracic Artery.
    *   **Second Part:** Deep to Pectoralis Minor. Gives off two branches: Thoracoacromial Artery and Lateral Thoracic Artery.
    *   **Third Part:** Distal to Pectoralis Minor. Gives off three branches: Subscapular Artery, Anterior Circumflex Humeral Artery, and Posterior Circumflex Humeral Artery.

2.  **Axillary Vein:** Formed by the union of the brachial veins and the basilic vein at the inferior border of the teres major. It lies medial to the axillary artery and receives tributaries corresponding to the branches of the axillary artery. It is often superficial to the artery and more vulnerable to injury.

3.  **Brachial Plexus:** This complex network of nerves (formed by ventral rami of C5-T1) passes from the neck into the axilla. Its cords (lateral, posterior, and medial) are named according to their relationship with the second part of the axillary artery. The brachial plexus gives rise to the major nerves of the upper limb (musculocutaneous, axillary, radial, median, ulnar).

4.  **Axillary Lymph Nodes:** A group of 20-30 lymph nodes arranged in five main groups (anterior/pectoral, posterior/subscapular, lateral/humeral, central, and apical/subclavicular). They receive lymphatic drainage from the upper limb, pectoral region, and breast. The central nodes receive lymph from the other three groups, and drain into the apical nodes, which then drain into the subclavian lymphatic trunk.

5.  **Axillary Sheath:** A fascial sleeve that encloses the axillary artery and the cords of the brachial plexus. It is an extension of the prevertebral fascia of the neck. The axillary vein lies outside this sheath.

### Neurovascular Relationships:

*   The **axillary artery** is typically surrounded by the cords of the brachial plexus. The lateral cord lies lateral to the second part of the artery, the medial cord lies medial, and the posterior cord lies posterior.
*   The **axillary vein** is medial and superficial to the axillary artery, making it more accessible for venipuncture but also more prone to injury.
*   The **long thoracic nerve** (supplying serratus anterior) and the **thoracodorsal nerve** (supplying latissimus dorsi) run on the respective muscles forming the medial and posterior walls of the axilla.

These intricate relationships are crucial for understanding the potential for neurovascular compromise in cases of trauma, tumor growth, or surgical interventions in the axillary region.

## 4. Function

The axilla, as a crucial anatomical passageway, serves several vital functions related to the upper limb and overall body physiology. Its primary role is to provide a protected pathway for the major neurovascular structures that supply and drain the upper extremity, while also facilitating lymphatic drainage and supporting the mobility of the shoulder joint.

### Key Functions:

1.  **Passageway for Neurovascular Structures:** The most critical function of the axilla is to serve as a protected conduit for the axillary artery, axillary vein, and the brachial plexus. These structures are essential for:
    *   **Arterial Supply:** The axillary artery delivers oxygenated blood to the entire upper limb, including the shoulder, arm, forearm, and hand. Its branches also supply muscles of the pectoral region and parts of the thoracic wall.
    *   **Venous Drainage:** The axillary vein collects deoxygenated blood from the upper limb and returns it to the heart, playing a vital role in maintaining venous return.
    *   **Nerve Supply:** The brachial plexus provides motor innervation to almost all muscles of the upper limb and sensory innervation to most of the skin of the upper limb. This allows for a wide range of movements, sensation, and reflexes.

2.  **Lymphatic Drainage:** The axillary lymph nodes are strategically located within the axilla to filter lymph from the upper limb, the pectoral region, and a significant portion of the breast. This function is critical for the body's immune response, as these nodes trap pathogens and cancer cells. Their involvement is particularly significant in the metastasis of breast cancer.

3.  **Facilitation of Shoulder Movement:** The loose connective tissue and fat within the axilla allow for the free movement of the humerus and scapula. As the arm abducts, the axilla widens, accommodating the movement of the humeral head and the stretching of the neurovascular bundle. This flexibility prevents compression of vital structures during arm movements.

4.  **Support and Protection:** The walls of the axilla, formed by various muscles and bones, provide a degree of support and protection to the delicate neurovascular structures passing through it. The fatty tissue also acts as a cushion against external forces.

5.  **Thermoregulation:** The axilla contains numerous sweat glands and is an area where heat can be dissipated from the body, contributing to thermoregulation.

In essence, the axilla acts as a dynamic anatomical bottleneck, efficiently channeling essential supplies and drainage for the entire upper limb while adapting to its extensive range of motion. Any compromise to this region can have widespread effects on the function and health of the upper extremity.

## 5. Innervation & Blood Supply

The axilla is a critical region for the neurovascular supply of the entire upper limb. It houses the axillary artery, axillary vein, and the brachial plexus, along with their numerous branches and tributaries. Understanding the precise course and distribution of these structures is paramount for clinical practice.

### Arterial Supply (Axillary Artery and its Branches):

The **axillary artery** is the main artery of the upper limb, a continuation of the subclavian artery. It begins at the lateral border of the first rib and ends at the inferior border of the teres major muscle, where it becomes the brachial artery. For descriptive purposes, it is divided into three parts based on its relationship to the **pectoralis minor muscle**:

*   **First Part (proximal to pectoralis minor):**
    *   **Superior Thoracic Artery:** A small artery that supplies the first and second intercostal spaces, and parts of the pectoralis major and minor muscles.

*   **Second Part (deep to pectoralis minor):**
    *   **Thoracoacromial Artery:** A short, thick trunk that immediately pierces the clavipectoral fascia and divides into four terminal branches (mnemonic: **C**adavers **A**re **D**ead **P**eople):
        *   **Clavicular branch:** Supplies the subclavius muscle and sternoclavicular joint.
        *   **Acromial branch:** Supplies the deltoid muscle and acromial network.
        *   **Deltoid branch:** Supplies the deltoid and pectoralis major muscles.
        *   **Pectoral branches:** Supply the pectoralis major and minor muscles.
    *   **Lateral Thoracic Artery:** Runs along the lateral border of the pectoralis minor. It supplies the serratus anterior muscle, pectoralis major, pectoralis minor, and the lateral part of the breast in females.

*   **Third Part (distal to pectoralis minor):**
    *   **Subscapular Artery:** The largest branch of the axillary artery. It quickly divides into:
        *   **Circumflex Scapular Artery:** Passes through the triangular space to supply muscles on the posterior aspect of the scapula.
        *   **Thoracodorsal Artery:** Supplies the latissimus dorsi muscle.
    *   **Anterior Circumflex Humeral Artery:** Winds around the surgical neck of the humerus anteriorly.
    *   **Posterior Circumflex Humeral Artery:** Winds around the surgical neck of the humerus posteriorly, often accompanied by the axillary nerve. It is larger than the anterior circumflex humeral artery.

### Venous Drainage (Axillary Vein and its Tributaries):

The **axillary vein** is the major vein of the axilla, formed by the union of the brachial veins (accompanying the brachial artery) and the basilic vein (a superficial vein of the arm) at the inferior border of the teres major muscle. It lies medial and superficial to the axillary artery and receives tributaries that generally correspond to the branches of the axillary artery. The axillary vein becomes the subclavian vein at the lateral border of the first rib.

*   **Tributaries:** Superior thoracic vein, thoracoacromial vein, lateral thoracic vein, subscapular vein, anterior and posterior circumflex humeral veins. The **cephalic vein** (another superficial vein of the arm) typically drains into the axillary vein in the deltopectoral triangle.

### Innervation (Brachial Plexus):

The **brachial plexus** is a complex network of nerves responsible for the motor and sensory innervation of the entire upper limb. It is formed by the anterior rami of spinal nerves C5, C6, C7, C8, and T1. Within the axilla, the brachial plexus is organized into three **cords** (lateral, posterior, and medial), named according to their relationship with the second part of the axillary artery:

*   **Lateral Cord:** Formed by the anterior divisions of the upper and middle trunks (C5-C7).
    *   **Branches:** Lateral pectoral nerve, musculocutaneous nerve, and the lateral root of the median nerve.
*   **Posterior Cord:** Formed by the posterior divisions of all three trunks (C5-T1).
    *   **Branches:** Upper subscapular nerve, thoracodorsal nerve, lower subscapular nerve, axillary nerve, and radial nerve.
*   **Medial Cord:** Formed by the anterior division of the lower trunk (C8-T1).
    *   **Branches:** Medial pectoral nerve, medial cutaneous nerve of the arm, medial cutaneous nerve of the forearm, ulnar nerve, and the medial root of the median nerve.

*   **Major Nerves of the Upper Limb Formed in the Axilla:**
    *   **Median Nerve:** Formed by the union of the lateral and medial roots from the lateral and medial cords, respectively. It supplies most of the flexor muscles of the forearm and some hand muscles.
    *   **Ulnar Nerve:** A continuation of the medial cord. It supplies some flexor muscles of the forearm and most intrinsic hand muscles.
    *   **Radial Nerve:** A continuation of the posterior cord. It supplies all extensor muscles of the arm and forearm.
    *   **Axillary Nerve:** A branch of the posterior cord. It supplies the deltoid and teres minor muscles and provides sensation over the lateral shoulder.
    *   **Musculocutaneous Nerve:** A branch of the lateral cord. It supplies the coracobrachialis, biceps brachii, and brachialis muscles and provides sensation to the lateral forearm.

## 6. Clinical Relevance

The axilla is a region of immense clinical significance due to its anatomical contents and its role as a common site for various pathologies. Understanding the clinical relevance of the axilla is crucial for diagnosis, treatment, and surgical interventions.

### Conditions and Injuries:

*   **Axillary Lymphadenopathy:** Enlargement of axillary lymph nodes is a common clinical finding. It can indicate infection (e.g., upper limb infections), inflammation, or malignancy (e.g., metastatic breast cancer, lymphoma). Palpation of the axilla is a routine part of physical examination, especially in breast cancer screening.
*   **Breast Cancer Metastasis:** The axillary lymph nodes are the primary site for lymphatic drainage from the breast. Therefore, breast cancer cells often metastasize to these nodes. Axillary lymph node dissection or sentinel lymph node biopsy is a critical part of breast cancer staging and treatment, as the presence and extent of nodal involvement significantly impact prognosis and treatment decisions.
*   **Axillary Artery Injury:** The axillary artery is vulnerable to injury from trauma (e.g., shoulder dislocations, humeral fractures, penetrating wounds) or iatrogenic causes (e.g., improper use of crutches, surgical procedures). Injury can lead to significant hemorrhage, ischemia of the upper limb, or formation of an aneurysm. Its close relationship with the brachial plexus means that arterial injury often accompanies nerve damage.
*   **Axillary Vein Thrombosis (Paget-Schroetter Syndrome):** Thrombosis (blood clot formation) in the axillary vein can occur spontaneously, often in young, athletic individuals (effort thrombosis), or due to repetitive overhead arm movements. It can also be associated with central venous catheterization. Symptoms include sudden onset of arm swelling, pain, and cyanosis.
*   **Brachial Plexus Injuries:** The brachial plexus is susceptible to injury from trauma (e.g., traction injuries during birth or motor vehicle accidents), compression (e.g., thoracic outlet syndrome, tumors), or iatrogenic causes. Injuries can result in varying degrees of motor and sensory deficits in the upper limb, depending on the specific nerves or cords affected.
*   **Axillary Nerve Injury:** Often occurs with anterior dislocation of the glenohumeral joint or fracture of the surgical neck of the humerus due to its close proximity. Injury leads to paralysis of the deltoid and teres minor muscles (resulting in inability to abduct the arm beyond 15 degrees and loss of external rotation) and sensory loss over the lateral aspect of the shoulder.
*   **Axillary Abscess:** Infections in the axilla can lead to abscess formation, often due to bacterial infections of hair follicles or sweat glands. These can be painful and require incision and drainage.
*   **Thoracic Outlet Syndrome (TOS):** While not exclusively an axillary condition, the neurovascular bundle (brachial plexus and subclavian vessels) can be compressed as it passes through the thoracic outlet, which includes the apex of the axilla. Compression can occur due to anatomical variations, trauma, or repetitive movements, leading to pain, numbness, tingling, and weakness in the upper limb.

### Surgical Considerations:

*   **Axillary Dissection:** A surgical procedure to remove axillary lymph nodes, primarily performed for staging and treatment of breast cancer. It carries risks of complications such as lymphedema (swelling due to impaired lymphatic drainage), nerve injury (e.g., long thoracic nerve, thoracodorsal nerve, intercostobrachial nerve), and seroma formation.
*   **Axillary Block:** A regional anesthesia technique where local anesthetic is injected around the brachial plexus in the axilla to provide anesthesia for surgical procedures on the arm, forearm, and hand. Precise anatomical knowledge is essential to ensure effective nerve blockade and avoid complications.
*   **Axillary Approach to Shoulder Surgery:** The axilla can be used as a surgical approach to access structures around the shoulder joint, particularly for certain types of humeral fractures or shoulder arthroplasty.

## 7. Key Diagrams

![Superficial nerves and vessels of the axilla](https://jncxejkssgvxhdurmvxy.supabase.co/storage/v1/object/public/avatars/Axilla.png)

*Superficial nerves and vessels of the axilla. English labels. From 'Atlas and Textbook of Human Anatomy', 1909, Vol. 3, fig.594, by Johannes Sobotta and J. Playfair McMurrich. Artist: K. Hajek. Retrieved from Sobotta's Anatomy plates at Wikimedia. Possible original source: Sobotta's atlas at Hathitrust Digital library.*

This detailed anatomical illustration shows the superficial neurovascular structures within the axillary region, providing a clear visual representation of the relationships between the major arteries, veins, and nerves that pass through this critical anatomical space. The diagram is particularly valuable for understanding the spatial arrangement of these structures and their clinical significance.

## 8. Mnemonics

*   **Axillary Artery Branches (from 1st to 3rd part):** "**S**crew **T**he **L**awyer, **S**ave **A** **P**atient":
    *   **S**uperior Thoracic Artery
    *   **T**horacoacromial Artery
    *   **L**ateral Thoracic Artery
    *   **S**ubscapular Artery
    *   **A**nterior Circumflex Humeral Artery
    *   **P**osterior Circumflex Humeral Artery

*   **Brachial Plexus Cords (relative to axillary artery):** "**L**ie **A**bove **M**e":
    *   **L**ateral Cord
    *   **A**rtery (Axillary)
    *   **M**edial Cord

*   **Brachial Plexus Branches (from lateral to medial):** "**M**y **A**unt **R**uns **M**akes **U**ncles **N**ervous":
    *   **M**usculocutaneous
    *   **A**xillary
    *   **R**adial
    *   **M**edian
    *   **U**lnar

## 9. Summary Table / Cheat Sheet

### Axillary Boundaries

| Wall | Structures Forming the Wall | Key Features |
|---|---|---|
| **Anterior** | Pectoralis Major, Pectoralis Minor, Clavipectoral Fascia | Forms anterior axillary fold |
| **Posterior** | Subscapularis, Teres Major, Latissimus Dorsi | Forms posterior axillary fold |
| **Medial** | Upper 4-5 ribs, Intercostal muscles, Serratus Anterior | Convex, stable base for scapular movement |
| **Lateral** | Intertubercular groove of humerus, Coracobrachialis, Biceps Brachii (short head) | Directs neurovascular structures to arm |
| **Apex** | Clavicle (anterior), 1st rib (medial), Scapula (posterior) | Cervicoaxillary canal - narrowest part |
| **Base** | Skin, Subcutaneous tissue, Axillary fascia | Armpit floor |

### Axillary Contents

| Structure | Description | Key Relations | Clinical Significance |
|---|---|---|---|
| **Axillary Artery** | Main arterial supply to upper limb | Surrounded by brachial plexus cords | Vulnerable to injury in shoulder dislocations |
| **Axillary Vein** | Main venous drainage from upper limb | Medial and superficial to artery | Common site for venipuncture |
| **Brachial Plexus** | C5-T1 nerve network | Cords named relative to 2nd part of artery | Susceptible to traction injuries |
| **Axillary Lymph Nodes** | 20-30 nodes in 5 groups | Interspersed in fatty tissue | Primary site for breast cancer metastasis |
| **Axillary Sheath** | Fascial sleeve | Encloses artery and plexus cords | Contains neurovascular bundle |

### Axillary Artery Branches

| Part | Branches | Supply Area |
|---|---|---|
| **1st Part** | Superior Thoracic Artery | 1st-2nd intercostal spaces, pectoral muscles |
| **2nd Part** | Thoracoacromial Artery | Clavicular, acromial, deltoid, pectoral branches |
| | Lateral Thoracic Artery | Serratus anterior, pectoral muscles, lateral breast |
| **3rd Part** | Subscapular Artery | Circumflex scapular, thoracodorsal branches |
| | Anterior Circumflex Humeral Artery | Anterior surgical neck of humerus |
| | Posterior Circumflex Humeral Artery | Posterior surgical neck of humerus |

## References

1. Snell, R. S. (2012). *Clinical Anatomy by Regions* (9th ed.). Lippincott Williams & Wilkins.
2. Drake, R. L., Vogl, A. W., & Mitchell, A. W. M. (2015). *Gray's Anatomy for Students* (3rd ed.). Churchill Livingstone Elsevier.
3. Moore, K. L., Dalley, A. F., & Agur, A. M. R. (2018). *Clinically Oriented Anatomy* (8th ed.). Wolters Kluwer.`
        },
        {
          id: 'upper-limb-innervation',
          name: 'Cutaneous Innervation',
          description: 'Skin sensation patterns'
        },
        {
          id: 'pectoral-region',
          name: 'Detailed Anatomy of the Pectoral Region',
          description: 'Comprehensive anatomy of the pectoral region',
          content: `# Detailed Anatomy of the Pectoral Region

## 1. Overview

The pectoral region, commonly known as the chest, is a vital anatomical area located on the anterior aspect of the thorax. It serves as a crucial link between the axial skeleton (trunk) and the appendicular skeleton (upper limb), facilitating a wide range of movements of the arm and shoulder girdle. Beyond its musculoskeletal functions, the pectoral region also houses important structures related to the respiratory and circulatory systems, and in females, it is home to the mammary glands, which have significant clinical relevance.

This region is characterized by several layers of muscles, fascia, and neurovascular structures that work synergistically to provide strength, stability, and mobility to the upper extremity. A thorough understanding of the detailed anatomy of the pectoral region is fundamental for medical professionals across various disciplines, including surgery, orthopedics, physical therapy, and radiology. This document aims to provide a comprehensive overview of this complex area, incorporating insights from authoritative anatomical texts such as Snell Clinical Anatomy, Gray's Anatomy, and Keith Moore Anatomy.

We will delve into the specific muscles, their origins, insertions, actions, and innervations, as well as the intricate relationships between the various structures. Clinical correlates will be highlighted to emphasize the practical application of anatomical knowledge, and mnemonics will be provided to aid in memorization. Finally, key diagrams and a summary table will consolidate the information for quick reference.

## 2. Location & Anatomy

The pectoral region occupies the anterior aspect of the chest wall, extending from the neck superiorly to the diaphragm inferiorly, and laterally to the axillary lines. It is superficially bounded by the skin and subcutaneous tissue, which in females includes the mammary gland. Deep to these layers lie the muscles and associated fascia that form the bulk of the region.

### Boundaries:

*   **Superiorly:** Clavicle
*   **Inferiorly:** Sixth or seventh rib, or the inferior border of the pectoralis major muscle.
*   **Medially:** Sternum
*   **Laterally:** Deltoid muscle and the anterior axillary fold.

### Anatomical Components:

The pectoral region is primarily composed of four muscles, along with their investing fascia, blood vessels, and nerves. These muscles are often referred to as the **anterior axio-appendicular muscles** because they connect the axial skeleton (thorax) to the appendicular skeleton (upper limb).

#### Muscles of the Pectoral Region:

1.  **Pectoralis Major:**
    *   **Overview:** The largest and most superficial muscle of the pectoral region, forming the bulk of the chest in males and lying deep to the mammary gland in females. It is a thick, fan-shaped muscle with two heads: a clavicular head and a sternocostal head.
    *   **Origin:**
        *   **Clavicular Head:** Medial half of the anterior surface of the clavicle.
        *   **Sternocostal Head:** Anterior surface of the sternum, upper six costal cartilages, and aponeurosis of the external oblique muscle.
    *   **Insertion:** Lateral lip of the intertubercular (bicipital) groove of the humerus.
    *   **Action:** Adducts, medially rotates, and flexes the arm. The clavicular head flexes the arm, while the sternocostal head extends the flexed arm.
    *   **Innervation:** Medial and lateral pectoral nerves (C5-T1).

2.  **Pectoralis Minor:**
    *   **Overview:** A thin, triangular muscle located deep to the pectoralis major. It forms part of the anterior wall of the axilla.
    *   **Origin:** Third, fourth, and fifth ribs, near their costal cartilages.
    *   **Insertion:** Medial border and superior surface of the coracoid process of the scapula.
    *   **Action:** Depresses the shoulder, protracts the scapula, and assists in forced inspiration by elevating the ribs.
    *   **Innervation:** Medial pectoral nerve (C8-T1).

3.  **Subclavius:**
    *   **Overview:** A small, triangular muscle located inferior to the clavicle.
    *   **Origin:** Junction of the first rib and its costal cartilage.
    *   **Insertion:** Subclavian groove on the inferior surface of the middle third of the clavicle.
    *   **Action:** Depresses the clavicle, steadies the clavicle during shoulder movements, and protects the subclavian vessels and brachial plexus from clavicular fractures.
    *   **Innervation:** Nerve to subclavius (C5-C6).

4.  **Serratus Anterior:**
    *   **Overview:** A broad, thin muscle that lies on the lateral aspect of the chest wall, deep to the scapula. It has a serrated (saw-toothed) appearance due to its multiple slips of origin.
    *   **Origin:** Outer surfaces of the upper eight or nine ribs.
    *   **Insertion:** Medial border of the scapula (costal surface).
    *   **Action:** Protracts the scapula (e.g., in punching), rotates the scapula (e.g., in overhead reaching), and holds the scapula against the thoracic wall.
    *   **Innervation:** Long thoracic nerve (C5-C7).

#### Fascia of the Pectoral Region:

*   **Pectoral Fascia:** A thin, investing fascia that covers the pectoralis major muscle and is continuous with the fascia of the anterior abdominal wall and the deltoid fascia.
*   **Clavipectoral Fascia:** A strong, fibrous sheet located deep to the pectoralis major, extending from the clavicle to the axillary fascia. It encloses the pectoralis minor and subclavius muscles. It is pierced by the cephalic vein, thoracoacromial artery and vein, and lateral pectoral nerve.

## 3. Structure & Relations

The pectoral region is a layered anatomical area, with various structures arranged in a specific order, each bearing important relations to its neighbors. Understanding these relationships is crucial for surgical approaches, diagnostic imaging, and comprehending the spread of infections or tumors.

### Layers of the Pectoral Region (from superficial to deep):

1.  **Skin and Subcutaneous Tissue:** The outermost layer, containing superficial fascia, fat, and the mammary gland (in females). The superficial fascia also contains the platysma muscle (in the neck region, extending into the upper chest) and cutaneous nerves and vessels.
2.  **Pectoralis Major Muscle:** The most superficial muscle, covering the anterior chest wall. Its two heads (clavicular and sternocostal) converge to insert onto the humerus. Deep to the pectoralis major lies the clavipectoral fascia.
3.  **Clavipectoral Fascia:** A strong fascial sheet that extends from the clavicle to the axillary fascia. It splits to enclose the subclavius and pectoralis minor muscles. Key structures that pierce the clavipectoral fascia include the cephalic vein, thoracoacromial artery and vein, and the lateral pectoral nerve.
4.  **Pectoralis Minor Muscle:** Located deep to the pectoralis major and enclosed by the clavipectoral fascia. It forms part of the anterior wall of the axilla and has important relations with the brachial plexus and axillary vessels.
5.  **Deep Structures:** Deep to the pectoralis minor and clavipectoral fascia are the ribs, intercostal muscles, and the serratus anterior muscle. The axillary artery, vein, and brachial plexus pass deep to the pectoralis minor as they enter the axilla. The long thoracic nerve runs on the superficial surface of the serratus anterior muscle.

### Important Spaces and Their Contents:

*   **Deltopectoral Triangle (Clavipectoral Triangle):** A triangular depression inferior to the lateral part of the clavicle, bounded by the pectoralis major, deltoid, and clavicle. It contains the **cephalic vein** (which drains into the axillary vein), and the deltoid branch of the thoracoacromial artery.
*   **Axilla (Armpit):** The pyramidal space inferior to the glenohumeral joint and superior to the axillary fascia. The pectoral muscles form part of its anterior wall. The axilla contains the axillary artery and vein, brachial plexus, and lymph nodes. The pectoralis minor muscle divides the axillary artery into three parts, which is a clinically important landmark.

### Relations of Key Structures:

*   **Pectoralis Major:**
    *   **Superficial:** Skin, superficial fascia, mammary gland (in females).
    *   **Deep:** Clavipectoral fascia, pectoralis minor, subclavius, ribs, intercostal muscles, serratus anterior, axillary vessels, brachial plexus.
*   **Pectoralis Minor:**
    *   **Superficial:** Pectoralis major, clavipectoral fascia.
    *   **Deep:** Ribs (3rd, 4th, 5th), intercostal muscles, serratus anterior, axillary artery (second part), axillary vein, cords of the brachial plexus.
*   **Subclavius:**
    *   **Superficial:** Clavicle, clavipectoral fascia.
    *   **Deep:** First rib, subclavian vessels, brachial plexus.
*   **Serratus Anterior:**
    *   **Superficial:** Pectoralis major, pectoralis minor, axillary vessels, brachial plexus, long thoracic nerve.
    *   **Deep:** Ribs, intercostal muscles.

These intricate relationships underscore the functional integration of the pectoral region with the upper limb and the thoracic cavity, highlighting its role as a conduit for neurovascular structures and a dynamic component of shoulder movement.

## 4. Function

The muscles of the pectoral region are primarily involved in movements of the upper limb and the shoulder girdle. They play crucial roles in various actions, from powerful pushing and throwing to subtle stabilization of the scapula.

### Functions of Individual Muscles:

*   **Pectoralis Major:**
    *   **Adduction of the Arm:** Brings the arm towards the midline of the body (e.g., bringing the arm down from an abducted position).
    *   **Medial Rotation of the Arm:** Rotates the arm inwards (e.g., turning the palm towards the body).
    *   **Flexion of the Arm:** The clavicular head is particularly active in flexing the arm from an extended position (e.g., raising the arm forward). The sternocostal head assists in extending the flexed arm back to the anatomical position.
    *   **Forced Inspiration:** When the arm is fixed (e.g., holding onto something overhead), the pectoralis major can act as an accessory muscle of inspiration, elevating the ribs and sternum to expand the thoracic cavity.

*   **Pectoralis Minor:**
    *   **Depression of the Shoulder:** Pulls the scapula downwards.
    *   **Protraction of the Scapula:** Pulls the scapula forward around the chest wall (e.g., in punching or reaching forward).
    *   **Downward Rotation of the Scapula:** Rotates the glenoid cavity inferiorly.
    *   **Assists in Forced Inspiration:** By elevating the third, fourth, and fifth ribs when the scapula is fixed.

*   **Subclavius:**
    *   **Depresses the Clavicle:** Pulls the clavicle downwards and medially.
    *   **Steadies the Clavicle:** Provides stability to the sternoclavicular joint during movements of the shoulder girdle.
    *   **Protects Subclavian Vessels and Brachial Plexus:** Acts as a cushion between the clavicle and the neurovascular structures, especially during clavicular fractures.

*   **Serratus Anterior:**
    *   **Protraction of the Scapula:** Pulls the scapula forward around the chest wall, essential for pushing and punching movements (hence often called the "boxer's muscle").
    *   **Upward Rotation of the Scapula:** Along with the upper and lower fibers of the trapezius, it rotates the glenoid cavity superiorly, allowing for overhead reaching and abduction of the arm beyond 90 degrees.
    *   **Holds Scapula Against Thoracic Wall:** Prevents "winging" of the scapula, ensuring the scapula remains closely applied to the rib cage during movements.

### Coordinated Actions:

The muscles of the pectoral region often work in synergy with other muscles of the shoulder girdle and upper limb to produce complex movements. For instance, the pectoralis major, along with the latissimus dorsi and teres major, forms a powerful adductor and medial rotator of the arm. The coordinated action of the serratus anterior and trapezius is critical for the scapulohumeral rhythm, which ensures smooth and efficient movement of the arm overhead.

## 5. Innervation & Blood Supply

The muscles and structures of the pectoral region receive their innervation and blood supply from branches of the brachial plexus and the axillary artery, respectively. Understanding these neurovascular pathways is essential for comprehending the functional deficits associated with nerve injuries and the clinical implications of vascular compromise.

### Innervation:

The nerves supplying the pectoral region are primarily branches of the **brachial plexus**, a complex network of nerves formed by the anterior rami of spinal nerves C5-T1. These nerves emerge from the neck, pass through the axilla, and distribute to the upper limb and shoulder girdle.

*   **Pectoralis Major:**
    *   **Lateral Pectoral Nerve (C5-C7):** Supplies both heads of the pectoralis major, but predominantly the clavicular head. It pierces the clavipectoral fascia.
    *   **Medial Pectoral Nerve (C8-T1):** Supplies both heads of the pectoralis major, but predominantly the sternocostal head. It also supplies the pectoralis minor. It typically pierces the pectoralis minor before reaching the pectoralis major.
    *   **Mnemonic:** "**L**ateral **P**ectoral nerve is **L**arger and **L**ateral to the medial pectoral nerve, supplying the **L**ateral (clavicular) head of pectoralis major." (Note: This mnemonic is for relative position, not exclusive supply).

*   **Pectoralis Minor:**
    *   **Medial Pectoral Nerve (C8-T1):** This nerve passes through or around the pectoralis minor to reach the pectoralis major. It supplies the pectoralis minor before or as it passes through it.

*   **Subclavius:**
    *   **Nerve to Subclavius (C5-C6):** A small nerve arising directly from the upper trunk of the brachial plexus. It descends anterior to the subclavian artery to supply the subclavius muscle.

*   **Serratus Anterior:**
    *   **Long Thoracic Nerve (C5-C7):** This nerve descends on the superficial surface of the serratus anterior muscle, supplying its various slips. It is vulnerable to injury during surgery (e.g., mastectomy) or trauma to the lateral chest wall.
    *   **Mnemonic:** "**SALT**: **S**erratus **A**nterior, **L**ong **T**horacic."

### Blood Supply:

The arterial supply to the pectoral region is primarily derived from branches of the **axillary artery**, which is a continuation of the subclavian artery. The axillary artery is divided into three parts by the pectoralis minor muscle, and its branches supply the muscles and other structures of the region.

*   **First Part of Axillary Artery (proximal to pectoralis minor):**
    *   **Superior Thoracic Artery:** Supplies the first and second intercostal spaces, and parts of the pectoralis major and minor.

*   **Second Part of Axillary Artery (deep to pectoralis minor):**
    *   **Thoracoacromial Artery:** A short trunk that immediately divides into four branches (pectoral, deltoid, acromial, clavicular) that supply the pectoral muscles, deltoid, and shoulder joint.
    *   **Lateral Thoracic Artery:** Supplies the serratus anterior, pectoralis major, and pectoralis minor muscles, and the lateral part of the breast in females.

*   **Third Part of Axillary Artery (distal to pectoralis minor):**
    *   **Subscapular Artery:** Gives rise to the circumflex scapular artery and thoracodorsal artery, which supply muscles of the posterior scapular region and latissimus dorsi, respectively.

### Venous Drainage:

Venous drainage generally follows the arterial supply, with veins accompanying the arteries and typically sharing similar names. The major veins include the **cephalic vein** (which drains into the axillary vein in the deltopectoral triangle) and the **axillary vein**, which is the continuation of the basilic vein and receives tributaries from the pectoral region before becoming the subclavian vein.

## 6. Clinical Relevance

The pectoral region is of significant clinical importance due to its superficial location, involvement in common injuries, and its role in various medical conditions. Understanding the clinical anatomy of this region is crucial for diagnosis, treatment, and surgical interventions.

### Injuries and Conditions:

*   **Pectoralis Major Rupture:** While uncommon, complete or partial tears of the pectoralis major muscle can occur, typically during strenuous activities like weightlifting (e.g., bench press). Ruptures usually occur at the musculotendinous junction or the humeral insertion. Symptoms include sudden pain, bruising, swelling, and a visible deformity (e.g., a hollow in the anterior axillary fold). Surgical repair is often necessary for athletes or individuals requiring full strength.
*   **Pectoralis Minor Syndrome (Thoracic Outlet Syndrome):** The pectoralis minor muscle can contribute to thoracic outlet syndrome (TOS) by compressing the neurovascular structures (brachial plexus and subclavian vessels) as they pass beneath it. This can lead to pain, numbness, tingling, and weakness in the upper limb, as well as vascular symptoms like swelling or discoloration. Surgical release of the pectoralis minor tendon may be performed in severe cases.
*   **Winged Scapula:** Damage to the **long thoracic nerve**, which innervates the serratus anterior muscle, can lead to paralysis of this muscle. Without the serratus anterior to hold the scapula against the thoracic wall and rotate it during arm elevation, the medial border of the scapula protrudes posteriorly, giving the appearance of a "winged scapula." This significantly impairs the ability to abduct the arm beyond 90 degrees and perform pushing movements.
*   **Breast Cancer and Lymphatic Drainage:** The pectoral region is highly relevant in the context of breast cancer. The lymphatic drainage of the breast primarily occurs via lymphatic vessels that follow the lateral thoracic artery to the axillary lymph nodes. Understanding the lymphatic pathways is critical for staging breast cancer and performing sentinel lymph node biopsies or axillary lymph node dissections.
*   **Clavicle Fractures:** Although the clavicle is part of the shoulder girdle, its close proximity and articulation with the sternum and scapula mean that fractures often impact the pectoral region. The subclavius muscle and the costoclavicular ligament play a role in stabilizing the clavicle, and their integrity can be compromised in such injuries.
*   **Chest Wall Deformities:** Conditions like **Pectus Excavatum** (funnel chest) and **Pectus Carinatum** (pigeon chest) are deformities of the sternum and costal cartilages that affect the anterior chest wall and thus the appearance and sometimes the function of the pectoral region. While primarily skeletal, these can impact the overlying muscles and may require surgical correction.

### Surgical Considerations:

*   **Mastectomy:** Surgical removal of breast tissue, often involving the pectoralis major muscle (in radical mastectomy) or preserving it (in modified radical mastectomy). Knowledge of the neurovascular supply to the pectoral muscles is crucial to minimize damage during these procedures.
*   **Pacemaker Implantation:** Pacemakers are often implanted in a subcutaneous pocket created in the pectoral region, typically beneath the clavicle and superficial to the pectoralis major muscle. Understanding the anatomy of the region is vital to avoid injury to underlying vessels and nerves.
*   **Muscle Flaps:** The pectoralis major muscle is a common choice for muscle flaps in reconstructive surgery (e.g., after head and neck cancer surgery) due to its robust blood supply and versatile arc of rotation. Knowledge of its origin, insertion, and neurovascular pedicle is essential for successful flap transfer.

## 7. Mnemonics

*   **Pectoralis Major Innervation:** "**L**ateral **P**ectoral nerve is **L**arger and **L**ateral to the medial pectoral nerve, supplying the **L**ateral (clavicular) head of pectoralis major." (Note: This mnemonic is for relative position, not exclusive supply).
*   **Serratus Anterior Innervation:** "**SALT**: **S**erratus **A**nterior, **L**ong **T**horacic."
*   **Thoracoacromial Artery Branches:** "**C**adavers **A**re **D**ead **P**eople": **C**lavicular, **A**cromial, **D**eltoid, **P**ectoral.

## 8. Summary Table / Cheat Sheet

| Muscle             | Origin                                                              | Insertion                                                 | Innervation                               | Action                                                                                             | 
| ------------------ | ------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- | 
| **Pectoralis Major** | **Clavicular Head:** Medial half of clavicle<br>**Sternocostal Head:** Sternum, upper 6 costal cartilages, external oblique aponeurosis | Lateral lip of intertubercular groove of humerus          | Medial and Lateral Pectoral Nerves (C5-T1) | Adducts, medially rotates, and flexes the arm. Clavicular head flexes, sternocostal head extends flexed arm. | 
| **Pectoralis Minor** | Ribs 3-5                                                            | Coracoid process of scapula                               | Medial Pectoral Nerve (C8-T1)             | Depresses and protracts scapula. Elevates ribs in forced inspiration.                                | 
| **Subclavius**     | First rib and costal cartilage                                      | Subclavian groove of clavicle                             | Nerve to Subclavius (C5-C6)               | Depresses and steadies clavicle.                                                                   | 
| **Serratus Anterior**| Outer surfaces of upper 8-9 ribs                                    | Medial border of scapula (costal surface)                 | Long Thoracic Nerve (C5-C7)               | Protracts and rotates scapula. Holds scapula against thoracic wall.                                | 

## References

1. Snell, R. S. (2012). *Clinical Anatomy by Regions* (9th ed.). Lippincott Williams & Wilkins.
2. Drake, R. L., Vogl, A. W., & Mitchell, A. W. M. (2015). *Gray's Anatomy for Students* (3rd ed.). Churchill Livingstone Elsevier.
3. Moore, K. L., Dalley, A. F., & Agur, A. M. R. (2018). *Clinically Oriented Anatomy* (8th ed.). Wolters Kluwer.`
        },
        {
          id: 'cubital-fossa',
          name: 'Cubital Fossa',
          description: 'Anatomy of the antecubital region',
          content: `# 📌 Cubital Fossa

## 1. Overview

The cubital fossa, also known as the antecubital fossa, is a triangular-shaped depression located on the anterior aspect of the elbow joint. It serves as a crucial anatomical passageway for several vital neurovascular structures that traverse between the arm and the forearm. Understanding the anatomy of the cubital fossa is of significant clinical importance, particularly in procedures such as venipuncture, blood pressure measurement, and in the diagnosis and management of various elbow injuries.

This region, though small, houses key nerves, arteries, and veins that are essential for the motor and sensory functions of the forearm and hand. Its boundaries are formed by specific muscles and an imaginary line connecting the humeral epicondyles, while its roof and floor are composed of fascia, skin, and underlying muscles. The contents of the cubital fossa are arranged in a specific order, which is critical for clinical identification and intervention.

Injuries or compressions within this confined space can lead to significant neurological or vascular compromise, highlighting the need for a thorough understanding of its intricate anatomy and relations. This document will delve into the detailed anatomy, function, innervation, blood supply, and clinical relevance of the cubital fossa, drawing upon authoritative anatomical sources to provide a comprehensive overview.

## 2. Location & Anatomy

The cubital fossa is an inverted triangular space situated on the anterior aspect of the elbow joint. It acts as a transitional zone, allowing the passage of neurovascular structures from the arm to the forearm. Its precise boundaries and contents are critical for both anatomical understanding and clinical procedures.

**Boundaries of the Cubital Fossa:**

The cubital fossa is defined by three muscular borders, a superior base, an inferior apex, a roof, and a floor:

*   **Superior Border (Base):** This is an imaginary horizontal line connecting the medial and lateral epicondyles of the humerus. This line forms the superior boundary of the triangular region.
*   **Medial Border:** Formed by the lateral margin of the **pronator teres muscle**. This muscle originates from the medial epicondyle of the humerus and the coronoid process of the ulna, extending obliquely across the forearm.
*   **Lateral Border:** Formed by the medial margin of the **brachioradialis muscle**. This muscle originates from the lateral supracondylar ridge of the humerus and extends down to the distal radius.
*   **Apex:** The point where the medial border (pronator teres) and the lateral border (brachioradialis) converge distally.

**Roof of the Cubital Fossa:**

The roof of the cubital fossa is formed by several layers, from superficial to deep:

*   **Skin:** The outermost layer.
*   **Superficial Fascia:** Contains the superficial veins of the forearm, notably the **median cubital vein**, which connects the cephalic and basilic veins. This vein is a common site for venipuncture due to its accessibility and relatively stable position.
*   **Deep Fascia:** A fibrous layer that provides support and separates superficial from deeper structures.
*   **Bicipital Aponeurosis:** A broad, flat tendinous expansion from the biceps brachii tendon that extends medially and blends with the deep fascia of the forearm. It provides protection to the underlying neurovascular structures and helps to dissipate the force of biceps contraction.

**Floor of the Cubital Fossa:**

The floor of the cubital fossa is formed by two muscles:

*   **Brachialis Muscle:** Located proximally, forming the upper part of the floor. This muscle lies deep to the biceps brachii and is a powerful flexor of the elbow joint.
*   **Supinator Muscle:** Located distally, forming the lower part of the floor. This muscle wraps around the proximal radius and is primarily responsible for supination of the forearm.

This well-defined anatomical arrangement creates a protected space for the vital structures passing through it, while also making them accessible for clinical examination and procedures.

## 3. Structure & Relations

The cubital fossa, despite its small size, is a critical anatomical region due to the passage and close relationships of several vital structures. Understanding these relationships is essential for clinical practice, as injuries or pathologies in this area can have significant consequences.

**Contents of the Cubital Fossa (from lateral to medial):**

The structures within the cubital fossa are arranged in a consistent order, which is often remembered by the mnemonic "**R**eally **N**eed **B**eer **T**o **B**e **A**t **M**y **N**icest" (Radial nerve, Biceps tendon, Brachial artery, Median nerve) or simply "**M**y **B**lood **T**urns **R**ed" (Median nerve, Brachial artery, Tendon of biceps brachii, Radial nerve) when considering medial to lateral.

1.  **Radial Nerve:**
    *   **Location:** Most lateral content of the cubital fossa.
    *   **Course:** Enters the fossa deep to the brachioradialis muscle. Within the fossa, it typically divides into its two terminal branches: the **superficial radial nerve** (sensory) and the **deep radial nerve** (motor, which pierces the supinator muscle to become the posterior interosseous nerve).
    *   **Relations:** Lies close to the lateral epicondyle of the humerus and the head of the radius. Vulnerable to fractures of the lateral epicondyle or dislocations of the radial head.

2.  **Biceps Brachii Tendon:**
    *   **Location:** Lies medial to the radial nerve, centrally located within the fossa.
    *   **Course:** The strong tendon of the biceps brachii muscle passes through the fossa to insert onto the radial tuberosity of the radius. It gives off the bicipital aponeurosis, which forms part of the roof of the fossa.
    *   **Relations:** Its central position makes it a key landmark for identifying other structures. Palpation of the biceps tendon is often used to locate the brachial artery.

3.  **Brachial Artery:**
    *   **Location:** Lies medial to the biceps tendon, positioned between the biceps tendon and the median nerve.
    *   **Course:** The main arterial supply to the arm, it enters the cubital fossa and typically bifurcates at the apex of the fossa (at the level of the radial neck) into its two terminal branches: the **radial artery** (lateral) and the **ulnar artery** (medial). The brachial pulse can be palpated medial to the biceps tendon.
    *   **Relations:** Its superficial position in the fossa makes it accessible for blood pressure measurement and arterial puncture. It is vulnerable to injury in supracondylar fractures of the humerus.

4.  **Median Nerve:**
    *   **Location:** Most medial content of the cubital fossa.
    *   **Course:** Passes through the fossa and then typically exits by passing between the two heads of the pronator teres muscle. It gives off the anterior interosseous nerve within the forearm.
    *   **Relations:** Lies medial to the brachial artery. Its passage through the pronator teres makes it susceptible to compression (pronator syndrome).

**Superficial Structures in the Roof:**

While not strictly *within* the fossa, the superficial structures in its roof are clinically significant:

*   **Median Cubital Vein:** Connects the cephalic vein (lateral) and the basilic vein (medial) on the anterior aspect of the elbow. This large, often prominent vein is the most common site for venipuncture.
*   **Medial Cutaneous Nerve of the Forearm:** Lies superficial to the median cubital vein.
*   **Lateral Cutaneous Nerve of the Forearm (from Musculocutaneous Nerve):** Lies superficial to the cephalic vein.

These intricate relationships highlight the vulnerability of the neurovascular structures within the cubital fossa to trauma, compression, or iatrogenic injury during medical procedures.

## 4. Function

The cubital fossa, while primarily a passageway for neurovascular structures, plays a crucial role in the overall function of the upper limb by facilitating the transmission of signals and blood supply to the forearm and hand. Its contents are directly involved in various motor, sensory, and circulatory functions.

**Motor Function:**

The nerves passing through the cubital fossa are responsible for innervating the muscles of the forearm and hand, enabling a wide range of movements:

*   **Radial Nerve:** Although it divides within the fossa, its branches (particularly the deep radial nerve/posterior interosseous nerve) are critical for the innervation of the extensor muscles of the forearm. These muscles are responsible for extension of the wrist and fingers, as well as supination of the forearm. Damage to the radial nerve in this region can lead to a "wrist drop" deformity.
*   **Median Nerve:** This nerve supplies most of the flexor muscles in the forearm, which are responsible for flexion of the wrist and fingers, and pronation of the forearm. It also innervates the thenar muscles (muscles of the thumb) and the lateral two lumbricals in the hand, crucial for fine motor movements and opposition of the thumb. Injury to the median nerve can result in significant loss of grip strength and dexterity.

**Sensory Function:**

The cubital fossa also facilitates sensory innervation to parts of the forearm and hand:

*   **Radial Nerve:** Provides sensory innervation to the posterior aspect of the arm and forearm, and the posterolateral aspect of the hand.
*   **Median Nerve:** Supplies sensory innervation to the lateral palm and the palmar surface of the lateral 3.5 fingers.
*   **Medial and Lateral Cutaneous Nerves of the Forearm:** While not strictly *within* the fossa, these nerves are located in its roof and provide sensation to the medial and lateral aspects of the forearm, respectively. The median cubital vein, a common site for venipuncture, is superficial to these nerves.

**Circulatory Function:**

The brachial artery and its branches within the cubital fossa are vital for maintaining blood flow to the entire forearm and hand:

*   **Brachial Artery:** This major artery is the continuation of the axillary artery and is the primary blood supply to the arm. Within the cubital fossa, it bifurcates into the radial and ulnar arteries, which then supply the respective compartments of the forearm and continue into the hand to form the palmar arches. The pulse of the brachial artery can be palpated in the cubital fossa, making it a crucial site for assessing peripheral circulation and measuring blood pressure.
*   **Superficial Veins (Median Cubital, Cephalic, Basilic):** These veins, located in the roof of the fossa, are essential for venous return from the forearm and hand. The median cubital vein, in particular, is a clinically important site for drawing blood (venipuncture) and administering intravenous fluids due to its consistent location and relatively large size.

In summary, the cubital fossa serves as a vital anatomical corridor, ensuring the proper functioning of the upper limb through its role in nerve conduction, muscle control, sensation, and blood circulation.

## 5. Innervation & Blood Supply

The innervation and blood supply within and around the cubital fossa are critical for the function and viability of the forearm and hand. This section details the specific nerves and arteries involved.

**Innervation:**

The cubital fossa is a transit point for several major nerves that originate from the brachial plexus and continue into the forearm and hand. While the brachial plexus itself is the source, the specific nerves passing through the fossa are:

*   **Median Nerve (C6-T1):**
    *   **Course:** Enters the cubital fossa medial to the brachial artery. It then passes between the two heads of the pronator teres muscle (humeral and ulnar heads) to enter the forearm.
    *   **Innervation:** In the forearm, it supplies most of the flexor muscles (e.g., flexor carpi radialis, palmaris longus, flexor digitorum superficialis, and the lateral half of flexor digitorum profundus). In the hand, it innervates the thenar muscles (abductor pollicis brevis, flexor pollicis brevis, opponens pollicis) and the lateral two lumbricals. It also provides sensory innervation to the lateral palm and the palmar surface of the lateral 3.5 digits.
    *   **Clinical Note:** Compression of the median nerve as it passes through the pronator teres can lead to **Pronator Syndrome**, characterized by pain and tenderness in the proximal forearm, and sensory deficits in the median nerve distribution.

*   **Radial Nerve (C5-T1):**
    *   **Course:** Enters the cubital fossa lateral to the biceps tendon. Within the fossa, it typically divides into its two terminal branches:
        *   **Superficial Radial Nerve:** A sensory nerve that descends under the brachioradialis muscle and provides sensation to the dorsum of the hand and the dorsal aspect of the lateral 3.5 digits.
        *   **Deep Radial Nerve:** A motor nerve that pierces the supinator muscle (passing through the arcade of Frohse in some individuals) to become the **posterior interosseous nerve**. It supplies the extensor muscles of the forearm.
    *   **Innervation:** The radial nerve and its branches supply all the muscles in the posterior compartment of the arm (triceps brachii) and forearm (e.g., brachioradialis, extensor carpi radialis longus and brevis, extensor digitorum). It provides sensory innervation to the posterior arm, posterior forearm, and the posterolateral aspect of the hand.
    *   **Clinical Note:** Injury to the radial nerve in this region can lead to **wrist drop**, an inability to extend the wrist and fingers.

*   **Musculocutaneous Nerve (C5-C7):**
    *   **Course:** While the musculocutaneous nerve primarily innervates muscles in the arm (biceps brachii, brachialis, coracobrachialis), its terminal sensory branch, the **lateral cutaneous nerve of the forearm (lateral antebrachial cutaneous nerve)**, passes through the roof of the cubital fossa.
    *   **Innervation:** Provides sensory innervation to the lateral aspect of the forearm.

*   **Ulnar Nerve (C8-T1):**
    *   **Course:** The ulnar nerve does not pass through the cubital fossa itself. Instead, it passes posterior to the medial epicondyle of the humerus, through the **cubital tunnel**, before entering the forearm. It is therefore superficial to the cubital fossa.
    *   **Innervation:** In the forearm, it supplies the flexor carpi ulnaris and the medial half of flexor digitorum profundus. In the hand, it innervates most of the intrinsic hand muscles (except the thenar muscles and lateral two lumbricals). It provides sensory innervation to the medial 1.5 fingers (anterior and posterior surfaces) and the associated medial palm area.
    *   **Clinical Note:** Compression of the ulnar nerve in the cubital tunnel can lead to **Cubital Tunnel Syndrome**, causing numbness and tingling in the little finger and medial half of the ring finger, and weakness of intrinsic hand muscles.

**Blood Supply:**

The primary arterial supply passing through the cubital fossa is the brachial artery, which then gives rise to the main arteries of the forearm.

*   **Brachial Artery:**
    *   **Course:** The continuation of the axillary artery, the brachial artery descends through the arm and enters the cubital fossa medial to the biceps tendon. At the apex of the cubital fossa (typically at the level of the radial neck), it bifurcates into the radial and ulnar arteries.
    *   **Clinical Note:** The brachial artery is the artery typically used for measuring blood pressure, with the stethoscope placed over it in the cubital fossa. It is also vulnerable to injury in supracondylar fractures of the humerus, which can lead to complications like Volkmann's ischemic contracture if blood flow is compromised.

*   **Radial Artery:**
    *   **Course:** The smaller of the two terminal branches of the brachial artery, it descends along the lateral side of the forearm, accompanying the radial nerve. It supplies the lateral compartment of the forearm.

*   **Ulnar Artery:**
    *   **Course:** The larger of the two terminal branches of the brachial artery, it descends along the medial side of the forearm, accompanying the ulnar nerve distally. It supplies the medial and central compartments of the forearm.

*   **Superficial Veins:**
    *   **Median Cubital Vein:** This prominent superficial vein lies in the roof of the cubital fossa, connecting the cephalic vein (laterally) and the basilic vein (medially). It is the most common site for venipuncture due to its accessibility and relatively fixed position.
    *   **Cephalic Vein:** Runs along the lateral aspect of the forearm and arm.
    *   **Basilic Vein:** Runs along the medial aspect of the forearm and arm.

This intricate network of nerves and vessels within and around the cubital fossa underscores its vital role in the neurovascular supply of the distal upper limb, making it a region of significant clinical interest.

## 6. Clinical Relevance

The cubital fossa is a highly significant anatomical region in clinical practice due to its superficial location and the vital neurovascular structures it houses. Injuries, infections, or medical procedures involving this area can have profound implications for the function of the entire upper limb.

**1. Venipuncture and Intravenous Access:**

*   **Median Cubital Vein:** This is the most common and preferred site for venipuncture (drawing blood) and intravenous (IV) cannulation (administering fluids or medications). Its large size, relatively superficial position, and stability (due to being anchored by the bicipital aponeurosis) make it ideal for these procedures. The median cubital vein connects the cephalic and basilic veins, providing a direct and accessible route for venous access.
*   **Clinical Considerations:** Proper technique is crucial to avoid injury to underlying structures, particularly the median nerve and brachial artery, which lie deep to the vein. Accidental arterial puncture can lead to hematoma, pain, and potential compromise of distal blood flow. Nerve injury can result in paresthesia, numbness, or weakness.

**2. Blood Pressure Measurement:**

*   **Brachial Artery:** The brachial artery, located medial to the biceps tendon in the cubital fossa, is the standard site for auscultating Korotkoff sounds during indirect blood pressure measurement. The stethoscope is placed over the artery, and the cuff is inflated around the arm to occlude blood flow, then slowly deflated to detect the systolic and diastolic pressures.
*   **Clinical Considerations:** Accurate placement of the stethoscope and proper cuff size are essential for reliable readings. Palpation of the brachial pulse in the fossa helps confirm the artery's location.

**3. Supracondylar Fractures of the Humerus:**

*   **Description:** These are common elbow fractures, especially in children, often resulting from a fall on an outstretched hand. The fracture occurs just above the epicondyles of the humerus.
*   **Clinical Relevance:** The close proximity of the brachial artery and median nerve to the distal humerus makes them highly vulnerable to injury in supracondylar fractures. Displacement of fracture fragments can compress, stretch, or lacerate these structures.
    *   **Brachial Artery Injury:** Can lead to **Volkmann's Ischemic Contracture**, a severe complication characterized by irreversible muscle necrosis and fibrosis in the forearm, resulting in a claw-like deformity of the hand. This is due to prolonged ischemia (lack of blood supply).
    *   **Median Nerve Injury:** Can cause sensory deficits in the median nerve distribution and weakness in forearm flexors and thenar muscles.
    *   **Radial Nerve Injury:** Less common in supracondylar fractures but can occur, leading to wrist drop.

**4. Nerve Entrapment Syndromes:**

*   **Pronator Syndrome:** Compression of the median nerve as it passes between the two heads of the pronator teres muscle. Symptoms include pain in the proximal forearm, tenderness over the pronator teres, and sensory disturbances in the median nerve distribution (thumb, index, middle, and lateral half of ring finger).
*   **Cubital Tunnel Syndrome:** While the ulnar nerve does not pass *through* the cubital fossa, it passes posterior to the medial epicondyle in the cubital tunnel, which is adjacent to the fossa. Compression here can cause numbness and tingling in the little finger and medial half of the ring finger, and weakness of intrinsic hand muscles.

**5. Tendon Ruptures:**

*   **Distal Biceps Tendon Rupture:** Although less common than proximal ruptures, the distal biceps tendon can rupture at its insertion into the radial tuberosity, often following a sudden, forceful contraction against resistance. This results in weakness in elbow flexion and forearm supination, and a characteristic "Popeye" deformity (retraction of the biceps muscle belly).

**6. Aneurysms and Pseudoaneurysms:**

*   The brachial artery in the cubital fossa can be a site for aneurysm formation or pseudoaneurysms, particularly after trauma or repeated arterial punctures. These can compress adjacent nerves or lead to distal embolization.

Given the critical structures and their vulnerability, a thorough understanding of the cubital fossa's anatomy is paramount for healthcare professionals to accurately diagnose and manage conditions affecting the elbow and forearm.

## 7. Mnemonics

Mnemonics are valuable tools for remembering the contents and boundaries of the cubital fossa, which can be challenging due to the number of structures in a confined space.

**Contents of the Cubital Fossa (Lateral to Medial):**

*   **R**eally **N**eed **B**eer **T**o **B**e **A**t **M**y **N**icest
    *   **R**adial **N**erve
    *   **B**iceps **T**endon
    *   **B**rachial **A**rtery
    *   **M**edian **N**erve

*   **M**y **B**lood **T**urns **R**ed (This mnemonic lists the contents from medial to lateral, which is the reverse order of the previous one, so be mindful of the direction)
    *   **M**edian nerve
    *   **B**rachial artery
    *   **T**endon of biceps
    *   **R**adial nerve

**Boundaries of the Cubital Fossa:**

*   **M**edial: **P**ronator **T**eres (Medial border is the lateral edge of Pronator Teres)
*   **L**ateral: **B**rachioradialis (Lateral border is the medial edge of Brachioradialis)

These mnemonics can aid in quick recall during examinations and clinical assessments.

## 8. Summary Table / Cheat Sheet

| Feature | Description | Clinical Significance |
| :------ | :---------- | :-------------------- |
| **Location** | Triangular depression on anterior elbow | Site for venipuncture, BP measurement |
| **Superior Border** | Imaginary line between medial & lateral epicondyles of humerus | Defines the base of the fossa |
| **Medial Border** | Lateral margin of Pronator Teres muscle | Helps define the medial boundary |
| **Lateral Border** | Medial margin of Brachioradialis muscle | Helps define the lateral boundary |
| **Apex** | Junction of Pronator Teres & Brachioradialis | Distal point of the fossa |
| **Roof** | Skin, superficial fascia (median cubital vein), deep fascia, bicipital aponeurosis | Superficial veins for IV access; aponeurosis protects deeper structures |
| **Floor** | Brachialis (proximally), Supinator (distally) | Muscles forming the base of the fossa |
| **Contents (Lateral to Medial)** | Radial Nerve, Biceps Tendon, Brachial Artery, Median Nerve | "Really Need Beer To Be At My Nicest" or "My Blood Turns Red" mnemonic |
| **Radial Nerve** | Divides into superficial & deep branches | Vulnerable to injury in lateral epicondyle fractures; wrist drop if damaged |
| **Biceps Tendon** | Inserts on radial tuberosity | Landmark for palpating brachial artery; rupture affects elbow flexion/supination |
| **Brachial Artery** | Bifurcates into radial & ulnar arteries | Site for BP measurement; vulnerable in supracondylar fractures (Volkmann's) |
| **Median Nerve** | Passes between pronator teres heads | Vulnerable to compression (Pronator Syndrome) |
| **Median Cubital Vein** | Connects cephalic & basilic veins in roof | Primary site for venipuncture |
| **Supracondylar Fracture** | Fracture of distal humerus | Risk of brachial artery & median nerve injury |
| **Pronator Syndrome** | Median nerve compression by pronator teres | Pain/numbness in median nerve distribution |
| **Cubital Tunnel Syndrome** | Ulnar nerve compression at medial epicondyle | Numbness/tingling in little finger & medial ring finger |`
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
- <strong>Cardiomyocytes</strong>: Specialized muscle cells with intercalated discs
- <strong>Intercalated discs</strong>: Cell junctions containing gap junctions and desmosomes
- <strong>T-tubules</strong>: Allow rapid depolarization throughout the cell
- <strong>Abundant mitochondria</strong>: Support high energy demands

### Heart Layers
- <strong>Epicardium</strong>: Outer layer (visceral pericardium)
- <strong>Myocardium</strong>: Middle muscular layer
- <strong>Endocardium</strong>: Inner lining, continuous with blood vessel endothelium

## Blood Vessel Histology

### Arteries
- <strong>Tunica intima</strong>: Endothelium and internal elastic lamina
- <strong>Tunica media</strong>: Smooth muscle and elastic fibers
- <strong>Tunica adventitia</strong>: Connective tissue and vasa vasorum

### Capillaries
- <strong>Continuous capillaries</strong>: Tight junctions, blood-brain barrier
- <strong>Fenestrated capillaries</strong>: Pores for filtration (kidneys, endocrine glands)
- <strong>Sinusoidal capillaries</strong>: Large gaps for cell passage (liver, spleen)

### Veins
- <strong>Thinner walls</strong>: Less smooth muscle than arteries
- <strong>Valves</strong>: Prevent backflow in larger veins
- <strong>Larger lumens</strong>: Accommodate blood return to heart

## Specialized Structures
- <strong>Cardiac conduction system</strong>: Modified cardiac muscle cells
- <strong>Baroreceptors</strong>: Pressure sensors in vessel walls
- <strong>Lymphatic vessels</strong>: One-way drainage system

## Pathological Changes
- <strong>Atherosclerosis</strong>: Plaque formation in arteries
- <strong>Hypertrophy</strong>: Enlarged cardiac muscle
- <strong>Thrombosis</strong>: Blood clot formation`,
      accessTier: 'premium',
      lastUpdated: '2024-01-12'
    }
  ];

  const canAccessContent = (accessTier: 'free' | 'starter' | 'premium') => {
    if (accessTier === 'free') return true;
    if (accessTier === 'starter') return ['starter', 'premium'].includes(userTier);
    if (accessTier === 'premium') return userTier === 'premium';
    return false;
  };

  const getAccessBadge = (tier: 'free' | 'starter' | 'premium') => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">Premium</Badge>;
      case 'starter':
        return <Badge className="bg-primary text-white font-semibold">Starter</Badge>;
      default:
        return <Badge variant="outline" className="font-semibold">Free</Badge>;
    }
  };

  const filteredTopics = anatomyTopics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    topic.type === activeTab
  );

  // Handle subtopic view
  if (selectedSubtopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedSubtopic(null)}
              className="hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              <span className="font-medium">Back to {selectedTopic?.name}</span>
            </Button>
          </div>

          {/* Subtopic Content */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-8 w-8" />
                <div>
                  <CardTitle className="text-3xl font-bold">
                    {selectedSubtopic.name}
                  </CardTitle>
                  {selectedSubtopic.description && (
                    <p className="text-blue-100 text-lg mt-2 font-medium">
                      {selectedSubtopic.description}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {selectedSubtopic.content ? (
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-bold prose-ul:text-gray-700 prose-li:mb-2">
                  <div dangerouslySetInnerHTML={{ __html: selectedSubtopic.content.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Content Coming Soon
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    This subtopic content is being developed. Check back soon for comprehensive, detailed notes.
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedTopic(null)}
              className="hover:bg-primary/10 transition-colors"
            >
              <ArrowLeft className="mr-2" size={18} />
              <span className="font-medium">Back to Categories</span>
            </Button>
            <div className="flex items-center space-x-4">
              {getAccessBadge(selectedTopic.accessTier)}
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={16} />
                <span className="text-sm font-medium">
                  Updated: {new Date(selectedTopic.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Topic Overview */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <BookOpen className="h-10 w-10" />
                <div>
                  <CardTitle className="text-4xl font-bold">
                    {selectedTopic.name}
                  </CardTitle>
                  <p className="text-blue-100 text-lg mt-2 font-medium">
                    Comprehensive study materials for medical students
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">

{canAccessContent(selectedTopic.accessTier) ? (
                  <div className="formatted-content prose prose-lg max-w-none">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: selectedTopic.content
                          // Convert markdown headers with advanced styling
                          .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-black text-black mt-8 mb-4 border-l-4 border-black pl-4 bg-gradient-to-r from-gray-50 to-gray-100 py-3 rounded-r-lg shadow-lg">$1</h3>')
                          .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-10 mb-6 border-b-3 border-primary pb-3">$1</h2>')
                          .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-8 text-center">$1</h1>')

                          // Enhanced bold text with medical theme colors - handle both ** and <strong> tags
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-md border border-blue-200 shadow-sm">$1</strong>')
                          .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-md border border-blue-200 shadow-sm">$1</strong>')

                          // Enhanced italic text with purple accent
                          .replace(/\*(.*?)\*/g, '<em class="italic text-purple-700 font-semibold bg-purple-50 px-1 rounded">$1</em>')

                          // Enhanced bullet points with medical theme
                          .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-4 text-gray-700 leading-relaxed pl-4 border-l-3 border-blue-300 bg-gradient-to-r from-blue-50 to-white py-2 rounded-r-md hover:from-blue-100 hover:to-blue-50 transition-all duration-200 relative"><span class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>$1</li>')

                          // Enhanced numbered lists
                          .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-4 text-gray-700 leading-relaxed pl-4 bg-gradient-to-r from-gray-50 to-white py-2 rounded-md border border-gray-200"><span class="font-bold text-primary mr-3 bg-primary text-white px-2 py-1 rounded-full text-sm">$1</span>$2</li>')

                          // Special formatting for anatomical terms and important medical concepts
                          .replace(/(Clavicle|Scapula|Humerus|Radius|Ulna|Anatomy|Physiology|Clinical)/gi, '<span class="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">$1</span>')

                          // Format special medical abbreviations
                          .replace(/\b([A-Z]{2,})\b/g, '<span class="font-semibold text-green-600 bg-green-50 px-1 rounded text-sm">$1</span>')

                          // Add spacing and improved paragraph formatting
                          .replace(/\n\n/g, '</p><p class="mb-6 leading-relaxed text-gray-700 text-justify">')
                          .replace(/\n/g, '<br/>')

                          // Wrap content in well-formatted paragraphs
                          .replace(/^(?!<[h|l|d])(.+)/gm, '<p class="mb-6 leading-relaxed text-gray-700 text-justify">$1</p>')

                          // Clean up any empty paragraphs
                          .replace(/<p class="mb-6 leading-relaxed text-gray-700 text-justify"><\/p>/g, '')

                          // Add special formatting for section breaks
                          .replace(/---/g, '<hr class="my-8 border-0 h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-30" />')
                      }} 
                    />
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Lock className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                      This content requires a {selectedTopic.accessTier} subscription to access comprehensive study materials.
                    </p>
                    <Link href="/pricing">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg">
                        <Star className="mr-2 h-5 w-5" />
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Subtopics Grid */}
          {selectedTopic.subtopics && (
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-2">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Study Topics ({selectedTopic.subtopics.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedTopic.subtopics.map((subtopic, index) => (
                  <Card 
                    key={subtopic.id} 
                    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                    onClick={() => setSelectedSubtopic(subtopic)}
                  >
                    <CardHeader className="pb-4 relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                            {subtopic.name}
                          </CardTitle>
                          {subtopic.description && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                              {subtopic.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2 font-semibold">
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold transition-all duration-300 group-hover:shadow-lg"
                        size="sm"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
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
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-3xl font-bold">
                  {selectedTopic.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {canAccessContent(selectedTopic.accessTier) ? (
                  <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed">
                    <div className="whitespace-pre-wrap">
                      {selectedTopic.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                      <Lock className="h-12 w-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Premium Content
                    </h3>
                    <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
                      This content requires a {selectedTopic.accessTier} subscription to access comprehensive study materials.
                    </p>
                    <Link href="/pricing">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg">
                        <Star className="mr-2 h-5 w-5" />
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategory(null)}
                className="hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="mr-2" size={18} />
                <span className="font-medium">Back to Categories</span>
              </Button>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name} Notes</h1>
                <p className="text-gray-600 font-medium">{selectedCategory.description}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-primary transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Topic Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <TabsList className="grid w-full grid-cols-3 gap-4 bg-gray-100 p-2 rounded-lg">
                  <TabsTrigger 
                    value="gross_anatomy" 
                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"
                  >
                    <Bone size={20} />
                    <span>Gross Anatomy</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="histology" 
                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"
                  >
                    <Microscope size={20} />
                    <span>Histology</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="embryology" 
                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"
                  >
                    <Baby size={20} />
                    <span>Embryology</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map((topic) => (
                      <Card 
                        key={topic.id}
                        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <CardHeader className="relative">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                              {topic.name}
                            </CardTitle>
                            {!canAccessContent(topic.accessTier) && (
                              <Lock className="text-gray-400" size={16} />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            {getAccessBadge(topic.accessTier)}
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Clock size={12} />
                              <span className="text-xs font-medium">
                                {new Date(topic.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                            {topic.content.substring(0, 120)}...
                          </p>
                          <Button 
                            variant={canAccessContent(topic.accessTier) ? "default" : "outline"}
                            size="sm" 
                            className={`w-full font-semibold transition-all duration-300 ${
                              canAccessContent(topic.accessTier) 
                                ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white group-hover:shadow-lg' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {canAccessContent(topic.accessTier) ? (
                              <>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Read More
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Upgrade to Access
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {filteredTopics.length === 0 && (
                    <div className="text-center py-16">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No topics found
                      </h3>
                      <p className="text-gray-600 text-lg max-w-md mx-auto">
                        Try adjusting your search or explore other categories.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <img 
              src="/DocDot Medical Student Logo.png" 
              alt="DocDot Medical Student Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Study Notes
              </h1>
              <p className="text-xl text-gray-600 font-medium mt-2">
                Comprehensive medical education materials for ambitious students
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center space-x-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Expert-Reviewed Content</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Student-Friendly Format</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Always Updated</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
                onClick={() => setSelectedCategory(category)}
              >
                <CardHeader className="relative pb-6">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600"></div>
                  <div className="flex items-center space-x-6 mt-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 group-hover:from-${category.color}-200 group-hover:to-${category.color}-300 transition-all duration-300`}>
                      <IconComponent className={`text-${category.color}-600 h-12 w-12`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-gray-600 text-lg font-medium mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <BookOpen size={18} />
                      <span className="font-semibold">{category.topicCount} topics available</span>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold px-6 py-2 transition-all duration-300 group-hover:shadow-lg"
                      size="sm"
                    >
                      Explore Now
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

- <strong>Cardiomyocytes</strong>: Specialized muscle cells with intercalated discs

- <strong>Intercalated discs</strong>: Cell junctions containing gap junctions and desmosomes

- <strong>T-tubules</strong>: Allow rapid depolarization throughout the cell

- <strong>Abundant mitochondria</strong>: Support high energy demands



### Heart Layers

- <strong>Epicardium</strong>: Outer layer (visceral pericardium)

- <strong>Myocardium</strong>: Middle muscular layer

- <strong>Endocardium</strong>: Inner lining, continuous with blood vessel endothelium



## Blood Vessel Histology



### Arteries

- <strong>Tunica intima</strong>: Endothelium and internal elastic lamina

- <strong>Tunica media</strong>: Smooth muscle and elastic fibers

- <strong>Tunica adventitia</strong>: Connective tissue and vasa vasorum



### Capillaries

- <strong>Continuous capillaries</strong>: Tight junctions, blood-brain barrier

- <strong>Fenestrated capillaries</strong>: Pores for filtration (kidneys, endocrine glands)

- <strong>Sinusoidal capillaries</strong>: Large gaps for cell passage (liver, spleen)



### Veins

- <strong>Thinner walls</strong>: Less smooth muscle than arteries

- <strong>Valves</strong>: Prevent backflow in larger veins

- <strong>Larger lumens</strong>: Accommodate blood return to heart



## Specialized Structures

- <strong>Cardiac conduction system</strong>: Modified cardiac muscle cells

- <strong>Baroreceptors</strong>: Pressure sensors in vessel walls

- <strong>Lymphatic vessels</strong>: One-way drainage system



## Pathological Changes

- <strong>Atherosclerosis</strong>: Plaque formation in arteries

- <strong>Hypertrophy</strong>: Enlarged cardiac muscle

- <strong>Thrombosis</strong>: Blood clot formation`,

      accessTier: 'premium',

      lastUpdated: '2024-01-12'

    }

  ];



  const canAccessContent = (accessTier: 'free' | 'starter' | 'premium') => {

    if (accessTier === 'free') return true;

    if (accessTier === 'starter') return ['starter', 'premium'].includes(userTier);

    if (accessTier === 'premium') return userTier === 'premium';

    return false;

  };



  const getAccessBadge = (tier: 'free' | 'starter' | 'premium') => {

    switch (tier) {

      case 'premium':

        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">Premium</Badge>;

      case 'starter':

        return <Badge className="bg-primary text-white font-semibold">Starter</Badge>;

      default:

        return <Badge variant="outline" className="font-semibold">Free</Badge>;

    }

  };



  const filteredTopics = anatomyTopics.filter(topic =>

    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) &&

    topic.type === activeTab

  );



  // Handle subtopic view

  if (selectedSubtopic) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">

        <div className="max-w-5xl mx-auto py-8 px-4">

          {/* Header */}

          <div className="flex items-center justify-between mb-8">

            <Button 

              variant="ghost" 

              onClick={() => setSelectedSubtopic(null)}

              className="hover:bg-primary/10 transition-colors"

            >

              <ArrowLeft className="mr-2" size={18} />

              <span className="font-medium">Back to {selectedTopic?.name}</span>

            </Button>

          </div>



          {/* Subtopic Content */}

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">

            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">

              <div className="flex items-center space-x-3">

                <BookOpen className="h-8 w-8" />

                <div>

                  <CardTitle className="text-3xl font-bold">

                    {selectedSubtopic.name}

                  </CardTitle>

                  {selectedSubtopic.description && (

                    <p className="text-blue-100 text-lg mt-2 font-medium">

                      {selectedSubtopic.description}

                    </p>

                  )}

                </div>

              </div>

            </CardHeader>

            <CardContent className="p-8">

              {selectedSubtopic.content ? (

                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-h1:text-4xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-primary prose-strong:font-bold prose-ul:text-gray-700 prose-li:mb-2">

                  <div dangerouslySetInnerHTML={{ __html: selectedSubtopic.content.replace(/\n/g, '<br/>') }} />

                </div>

              ) : (

                <div className="text-center py-16">

                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">

                    <BookOpen className="h-12 w-12 text-primary" />

                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">

                    Content Coming Soon

                  </h3>

                  <p className="text-gray-600 text-lg max-w-md mx-auto">

                    This subtopic content is being developed. Check back soon for comprehensive, detailed notes.

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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">

        <div className="max-w-6xl mx-auto py-8 px-4">

          {/* Header */}

          <div className="flex items-center justify-between mb-8">

            <Button 

              variant="ghost" 

              onClick={() => setSelectedTopic(null)}

              className="hover:bg-primary/10 transition-colors"

            >

              <ArrowLeft className="mr-2" size={18} />

              <span className="font-medium">Back to Categories</span>

            </Button>

            <div className="flex items-center space-x-4">

              {getAccessBadge(selectedTopic.accessTier)}

              <div className="flex items-center space-x-2 text-gray-600">

                <Clock size={16} />

                <span className="text-sm font-medium">

                  Updated: {new Date(selectedTopic.lastUpdated).toLocaleDateString()}

                </span>

              </div>

            </div>

          </div>



          {/* Topic Overview */}

          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">

            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">

              <div className="flex items-center space-x-3">

                <BookOpen className="h-10 w-10" />

                <div>

                  <CardTitle className="text-4xl font-bold">

                    {selectedTopic.name}

                  </CardTitle>

                  <p className="text-blue-100 text-lg mt-2 font-medium">

                    Comprehensive study materials for medical students

                  </p>

                </div>

              </div>

            </CardHeader>

            <CardContent className="p-8">



{canAccessContent(selectedTopic.accessTier) ? (

                  <div className="formatted-content prose prose-lg max-w-none">

                    <div 

                      dangerouslySetInnerHTML={{ 

                        __html: selectedTopic.content

                          // Convert markdown headers with advanced styling

                          .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-black text-black mt-8 mb-4 border-l-4 border-black pl-4 bg-gradient-to-r from-gray-50 to-gray-100 py-3 rounded-r-lg shadow-lg">$1</h3>')

                          .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-10 mb-6 border-b-3 border-primary pb-3">$1</h2>')

                          .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-8 text-center">$1</h1>')



                          // Enhanced bold text with medical theme colors - handle both ** and <strong> tags

                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-md border border-blue-200 shadow-sm">$1</strong>')

                          .replace(/<strong>(.*?)<\/strong>/g, '<strong class="font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 rounded-md border border-blue-200 shadow-sm">$1</strong>')



                          // Enhanced italic text with purple accent

                          .replace(/\*(.*?)\*/g, '<em class="italic text-purple-700 font-semibold bg-purple-50 px-1 rounded">$1</em>')



                          // Enhanced bullet points with medical theme

                          .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-4 text-gray-700 leading-relaxed pl-4 border-l-3 border-blue-300 bg-gradient-to-r from-blue-50 to-white py-2 rounded-r-md hover:from-blue-100 hover:to-blue-50 transition-all duration-200 relative"><span class="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></span>$1</li>')



                          // Enhanced numbered lists

                          .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-4 text-gray-700 leading-relaxed pl-4 bg-gradient-to-r from-gray-50 to-white py-2 rounded-md border border-gray-200"><span class="font-bold text-primary mr-3 bg-primary text-white px-2 py-1 rounded-full text-sm">$1</span>$2</li>')



                          // Special formatting for anatomical terms and important medical concepts

                          .replace(/(Clavicle|Scapula|Humerus|Radius|Ulna|Anatomy|Physiology|Clinical)/gi, '<span class="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">$1</span>')



                          // Format special medical abbreviations

                          .replace(/\b([A-Z]{2,})\b/g, '<span class="font-semibold text-green-600 bg-green-50 px-1 rounded text-sm">$1</span>')



                          // Add spacing and improved paragraph formatting

                          .replace(/\n\n/g, '</p><p class="mb-6 leading-relaxed text-gray-700 text-justify">')

                          .replace(/\n/g, '<br/>')



                          // Wrap content in well-formatted paragraphs

                          .replace(/^(?!<[h|l|d])(.+)/gm, '<p class="mb-6 leading-relaxed text-gray-700 text-justify">$1</p>')



                          // Clean up any empty paragraphs

                          .replace(/<p class="mb-6 leading-relaxed text-gray-700 text-justify"><\/p>/g, '')



                          // Add special formatting for section breaks

                          .replace(/---/g, '<hr class="my-8 border-0 h-1 bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-30" />')

                      }} 

                    />

                  </div>

                ) : (

                  <div className="text-center py-16">

                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">

                      <Lock className="h-12 w-12 text-purple-600" />

                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">

                      Premium Content

                    </h3>

                    <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">

                      This content requires a {selectedTopic.accessTier} subscription to access comprehensive study materials.

                    </p>

                    <Link href="/pricing">

                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg">

                        <Star className="mr-2 h-5 w-5" />

                        Upgrade Now

                      </Button>

                    </Link>

                  </div>

                )}

            </CardContent>

          </Card>



          {/* Subtopics Grid */}

          {selectedTopic.subtopics && (

            <div>

              <div className="flex items-center space-x-3 mb-6">

                <div className="bg-gradient-to-r from-primary to-blue-600 rounded-full p-2">

                  <Users className="h-6 w-6 text-white" />

                </div>

                <h3 className="text-3xl font-bold text-gray-900">

                  Study Topics ({selectedTopic.subtopics.length})

                </h3>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {selectedTopic.subtopics.map((subtopic, index) => (

                  <Card 

                    key={subtopic.id} 

                    className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"

                    onClick={() => setSelectedSubtopic(subtopic)}

                  >

                    <CardHeader className="pb-4 relative">

                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>

                      <div className="flex items-start justify-between">

                        <div className="flex-1">

                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">

                            {subtopic.name}

                          </CardTitle>

                          {subtopic.description && (

                            <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">

                              {subtopic.description}

                            </p>

                          )}

                        </div>

                        <Badge variant="secondary" className="ml-2 font-semibold">

                          #{index + 1}

                        </Badge>

                      </div>

                    </CardHeader>

                    <CardContent className="pt-0">

                      <Button 

                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold transition-all duration-300 group-hover:shadow-lg"

                        size="sm"

                      >

                        <BookOpen className="mr-2 h-4 w-4" />

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

            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">

              <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">

                <CardTitle className="text-3xl font-bold">

                  {selectedTopic.name}

                </CardTitle>

              </CardHeader>

              <CardContent className="p-8">

                {canAccessContent(selectedTopic.accessTier) ? (

                  <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed">

                    <div className="whitespace-pre-wrap">

                      {selectedTopic.content}

                    </div>

                  </div>

                ) : (

                  <div className="text-center py-16">

                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">

                      <Lock className="h-12 w-12 text-purple-600" />

                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">

                      Premium Content

                    </h3>

                    <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">

                      This content requires a {selectedTopic.accessTier} subscription to access comprehensive study materials.

                    </p>

                    <Link href="/pricing">

                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold px-8 py-3 text-lg">

                        <Star className="mr-2 h-5 w-5" />

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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">

      <div className="max-w-7xl mx-auto py-8 px-4">

          {/* Header */}

          <div className="flex items-center justify-between mb-8">

            <div className="flex items-center space-x-4">

              <Button 

                variant="ghost" 

                onClick={() => setSelectedCategory(null)}

                className="hover:bg-primary/10 transition-colors"

              >

                <ArrowLeft className="mr-2" size={18} />

                <span className="font-medium">Back to Categories</span>

              </Button>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">

                <h1 className="text-3xl font-bold text-gray-900">{selectedCategory.name} Notes</h1>

                <p className="text-gray-600 font-medium">{selectedCategory.description}</p>

              </div>

            </div>

          </div>



          {/* Search */}

          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">

            <CardContent className="p-6">

              <div className="relative">

                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

                <Input

                  placeholder="Search topics..."

                  value={searchQuery}

                  onChange={(e) => setSearchQuery(e.target.value)}

                  className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-primary transition-colors"

                />

              </div>

            </CardContent>

          </Card>



          {/* Topic Type Tabs */}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">

              <CardContent className="p-6">

                <TabsList className="grid w-full grid-cols-3 gap-4 bg-gray-100 p-2 rounded-lg">

                  <TabsTrigger 

                    value="gross_anatomy" 

                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"

                  >

                    <Bone size={20} />

                    <span>Gross Anatomy</span>

                  </TabsTrigger>

                  <TabsTrigger 

                    value="histology" 

                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"

                  >

                    <Microscope size={20} />

                    <span>Histology</span>

                  </TabsTrigger>

                  <TabsTrigger 

                    value="embryology" 

                    className="flex items-center space-x-3 data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3 px-6 transition-all"

                  >

                    <Baby size={20} />

                    <span>Embryology</span>

                  </TabsTrigger>

                </TabsList>



                <TabsContent value={activeTab} className="mt-8">

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {filteredTopics.map((topic) => (

                      <Card 

                        key={topic.id}

                        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/90 backdrop-blur-sm overflow-hidden"

                        onClick={() => setSelectedTopic(topic)}

                      >

                        <CardHeader className="relative">

                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600"></div>

                          <div className="flex items-center justify-between mb-2">

                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">

                              {topic.name}

                            </CardTitle>

                            {!canAccessContent(topic.accessTier) && (

                              <Lock className="text-gray-400" size={16} />

                            )}

                          </div>

                          <div className="flex items-center justify-between">

                            {getAccessBadge(topic.accessTier)}

                            <div className="flex items-center space-x-1 text-gray-500">

                              <Clock size={12} />

                              <span className="text-xs font-medium">

                                {new Date(topic.lastUpdated).toLocaleDateString()}

                              </span>

                            </div>

                          </div>

                        </CardHeader>

                        <CardContent>

                          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">

                            {topic.content.substring(0, 120)}...

                          </p>

                          <Button 

                            variant={canAccessContent(topic.accessTier) ? "default" : "outline"}

                            size="sm" 

                            className={`w-full font-semibold transition-all duration-300 ${

                              canAccessContent(topic.accessTier) 

                                ? 'bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white group-hover:shadow-lg' 

                                : 'hover:bg-gray-100'

                            }`}

                          >

                            {canAccessContent(topic.accessTier) ? (

                              <>

                                <BookOpen className="mr-2 h-4 w-4" />

                                Read More

                              </>

                            ) : (

                              <>

                                <Star className="mr-2 h-4 w-4" />

                                Upgrade to Access

                              </>

                            )}

                          </Button>

                        </CardContent>

                      </Card>

                    ))}

                  </div>



                  {filteredTopics.length === 0 && (

                    <div className="text-center py-16">

                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">

                        <BookOpen className="h-12 w-12 text-gray-400" />

                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">

                        No topics found

                      </h3>

                      <p className="text-gray-600 text-lg max-w-md mx-auto">

                        Try adjusting your search or explore other categories.

                      </p>

                    </div>

                  )}

                </TabsContent>

              </CardContent>

            </Card>

          </Tabs>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">

      <div className="max-w-7xl mx-auto py-12 px-4">

        {/* Header */}

        <div className="text-center mb-12">

          <div className="flex items-center justify-center space-x-4 mb-6">

            <img 

              src="/DocDot Medical Student Logo.png" 

              alt="DocDot Medical Student Logo" 

              className="h-16 w-auto"

            />

            <div>

              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">

                Study Notes

              </h1>

              <p className="text-xl text-gray-600 font-medium mt-2">

                Comprehensive medical education materials for ambitious students

              </p>

            </div>

          </div>

          <div className="flex items-center justify-center space-x-8 opacity-60">

            <div className="flex items-center space-x-2">

              <Star className="h-5 w-5 text-yellow-500" />

              <span className="text-sm font-medium text-gray-600">Expert-Reviewed Content</span>

            </div>

            <div className="flex items-center space-x-2">

              <Users className="h-5 w-5 text-blue-500" />

              <span className="text-sm font-medium text-gray-600">Student-Friendly Format</span>

            </div>

            <div className="flex items-center space-x-2">

              <Download className="h-5 w-5 text-green-500" />

              <span className="text-sm font-medium text-gray-600">Always Updated</span>

            </div>

          </div>

        </div>



        {/* Categories Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {categories.map((category) => {

            const IconComponent = category.icon;

            return (

              <Card 

                key={category.id}

                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"

                onClick={() => setSelectedCategory(category)}

              >

                <CardHeader className="relative pb-6">

                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600"></div>

                  <div className="flex items-center space-x-6 mt-4">

                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-${category.color}-100 to-${category.color}-200 group-hover:from-${category.color}-200 group-hover:to-${category.color}-300 transition-all duration-300`}>

                      <IconComponent className={`text-${category.color}-600 h-12 w-12`} />

                    </div>

                    <div className="flex-1">

                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">

                        {category.name}

                      </CardTitle>

                      <p className="text-gray-600 text-lg font-medium mt-1">

                        {category.description}

                      </p>

                    </div>

                  </div>

                </CardHeader>

                <CardContent>

                  <div className="flex items-center justify-between">

                    <div className="flex items-center space-x-2 text-gray-600">

                      <BookOpen size={18} />

                      <span className="font-semibold">{category.topicCount} topics available</span>

                    </div>

                    <Button 

                      className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold px-6 py-2 transition-all duration-300 group-hover:shadow-lg"

                      size="sm"

                    >

                      Explore Now

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