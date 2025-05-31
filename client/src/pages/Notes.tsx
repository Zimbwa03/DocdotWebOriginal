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
      name: 'Head and Neck Anatomy',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Head and Neck Anatomy

## Overview
The head and neck region contains some of the most complex anatomical structures in the human body, housing vital organs for sensation, communication, and nutrition.

## Key Structures

### Skull and Facial Bones
- **Frontal bone**: Forms the forehead and roof of the orbits
- **Parietal bones**: Form the sides and roof of the skull
- **Temporal bones**: House the ear structures and form part of the skull base
- **Occipital bone**: Forms the back of the skull
- **Maxilla**: Upper jaw bone, forms part of the orbit and nasal cavity
- **Mandible**: Lower jaw bone, the only movable bone of the skull

### Major Muscles
- **Temporalis**: Primary muscle for jaw elevation
- **Masseter**: Powerful muscle for mastication
- **Pterygoid muscles**: Assist in jaw movement and grinding
- **Muscles of facial expression**: Controlled by facial nerve (CN VII)

### Blood Supply
- **Carotid arteries**: Primary blood supply to the head and neck
- **Vertebral arteries**: Supply the posterior brain
- **Facial artery**: Supplies the face
- **Temporal artery**: Supplies the temporal region

### Innervation
- **Trigeminal nerve (CN V)**: Sensation to face, motor to muscles of mastication
- **Facial nerve (CN VII)**: Motor to muscles of facial expression
- **Glossopharyngeal nerve (CN IX)**: Sensation and taste to posterior tongue
- **Vagus nerve (CN X)**: Parasympathetic innervation

## Clinical Correlations
Understanding head and neck anatomy is crucial for:
- Dental procedures
- Facial surgery
- Neurological examinations
- Emergency airway management`,
      accessTier: 'free',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      name: 'Upper Limb Anatomy',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: `# Upper Limb Anatomy

## Overview
The upper limb is designed for manipulation and interaction with the environment, featuring complex joints and precise muscle control.

## Regions

### Shoulder Girdle
- **Clavicle**: Connects upper limb to axial skeleton
- **Scapula**: Provides muscle attachment and joint articulation
- **Glenohumeral joint**: Ball and socket joint with greatest range of motion

### Arm (Brachium)
- **Humerus**: Single bone of the arm
- **Biceps brachii**: Primary elbow flexor and supinator
- **Triceps brachii**: Primary elbow extensor
- **Brachialis**: Pure elbow flexor

### Forearm (Antebrachium)
- **Radius**: Lateral bone, rotates during pronation/supination
- **Ulna**: Medial bone, forms main elbow joint
- **Flexor compartment**: Muscles that flex wrist and fingers
- **Extensor compartment**: Muscles that extend wrist and fingers

### Hand
- **Carpal bones**: Eight bones forming the wrist
- **Metacarpals**: Five bones of the palm
- **Phalanges**: Finger bones (3 per finger, 2 for thumb)
- **Thenar muscles**: Thumb muscles
- **Hypothenar muscles**: Little finger muscles
- **Interossei**: Fine motor control muscles

## Blood Supply
- **Subclavian artery**: Main arterial supply
- **Axillary artery**: Continues as brachial artery
- **Radial and ulnar arteries**: Forearm vessels forming hand arches

## Clinical Applications
- Fracture patterns and healing
- Nerve compression syndromes
- Sports injuries
- Surgical approaches`,
      accessTier: 'starter',
      lastUpdated: '2024-01-10'
    },
    {
      id: 3,
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