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
                          .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold text-blue-700 mt-8 mb-4 border-l-4 border-blue-500 pl-4 bg-gradient-to-r from-blue-50 to-blue-100 py-3 rounded-r-lg shadow-sm">$1</h3>')
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