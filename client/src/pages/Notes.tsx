import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen, Brain, Stethoscope, Heart, Baby, Eye, Microscope } from 'lucide-react';

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
  accessTier: 'free';
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

  const categories: Category[] = [
    {
      id: 1,
      name: 'Anatomy',
      description: 'Human body structure and organization',
      icon: BookOpen,
      topicCount: 7,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Histology',
      description: 'Microscopic tissue structure',
      icon: Microscope,
      topicCount: 12,
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Embryology',
      description: 'Development and formation',
      icon: Baby,
      topicCount: 8,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Physiology',
      description: 'Body functions and processes',
      icon: Heart,
      topicCount: 15,
      color: 'bg-red-500'
    },
    {
      id: 5,
      name: 'Pathology',
      description: 'Disease processes and mechanisms',
      icon: Stethoscope,
      topicCount: 10,
      color: 'bg-orange-500'
    },
    {
      id: 6,
      name: 'Ophthalmology',
      description: 'Eye anatomy and vision',
      icon: Eye,
      topicCount: 6,
      color: 'bg-teal-500'
    },
    {
      id: 7,
      name: 'Neuroscience',
      description: 'Nervous system and behavior',
      icon: Brain,
      topicCount: 9,
      color: 'bg-indigo-500'
    }
  ];

  const topics: Topic[] = [
    {
      id: 1,
      name: 'Head and Neck',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: 'The head and neck region contains complex anatomical structures including the brain, cranial nerves, major blood vessels, and specialized organs for vision, hearing, smell, and taste.',
      accessTier: 'free',
      lastUpdated: '2024-01-15',
      subtopics: [
        { id: 'skull-cranium', name: 'Skull and Cranium', description: 'Bones of the skull, sutures, and cranial cavity' },
        { id: 'facial-bones', name: 'Facial Bones and Sinuses', description: 'Maxilla, mandible, nasal bones, paranasal sinuses' },
        { id: 'scalp-face', name: 'Scalp and Face', description: 'Layers of scalp, facial muscles, and expressions' },
        { id: 'cranial-nerves', name: 'Cranial Nerves', description: 'All 12 cranial nerves, origins, and distributions' },
        { id: 'orbit-eye', name: 'Orbit and Eye', description: 'Orbital anatomy, extraocular muscles, visual pathway' },
        { id: 'ear-hearing', name: 'Ear and Hearing', description: 'External, middle, and inner ear anatomy' },
        { id: 'nasal-cavity', name: 'Nasal Cavity and Olfaction', description: 'Nasal anatomy, olfactory system, and breathing' },
        { id: 'oral-cavity', name: 'Oral Cavity and Tongue', description: 'Mouth anatomy, teeth, tongue, and taste' },
        { id: 'pharynx-larynx', name: 'Pharynx and Larynx', description: 'Throat anatomy, swallowing, and voice production' },
        { id: 'neck-triangles', name: 'Neck Triangles and Fascia', description: 'Cervical triangles, fascial planes, and compartments' },
        { id: 'thyroid-parathyroid', name: 'Thyroid and Parathyroid', description: 'Endocrine glands of the neck' },
        { id: 'cervical-vertebrae', name: 'Cervical Vertebrae', description: 'C1-C7 anatomy and cervical spine movements' },
        { id: 'head-neck-vessels', name: 'Blood Vessels of Head and Neck', description: 'Carotid arteries, jugular veins, and circulation' },
        { id: 'lymphatics-head-neck', name: 'Lymphatics of Head and Neck', description: 'Lymph nodes and drainage patterns' },
        { id: 'autonomic-head-neck', name: 'Autonomic Innervation', description: 'Sympathetic and parasympathetic supply' },
        { id: 'head-neck-surface', name: 'Surface Anatomy', description: 'Clinical landmarks and examination techniques' }
      ]
    },
    {
      id: 2,
      name: 'Upper Limb',
      category: 'Anatomy',
      type: 'gross_anatomy',
      content: 'The upper limb is designed for manipulation and interaction with the environment.',
      accessTier: 'free',
      lastUpdated: '2024-01-10',
      subtopics: [
        {
          id: 'upper-limb-bones',
          name: 'Bones of the Upper Limb',
          description: 'Clavicle, scapula, humerus, radius, ulna, hand',
          content: `
            <div class="prose prose-lg max-w-none">
              <h2>📌 Clavicle Bone</h2>
              
              <h3><strong>1. Overview</strong></h3>
              <p>The clavicle, commonly known as the collarbone, is one of the bones of the upper limb girdle. Together with the scapula, it forms the shoulder girdle.</p>
              
              <h3><strong>2. Location & Anatomy</strong></h3>
              <p>The clavicle is a long, thin bone that lies horizontally at the base of the neck. It is located anteriorly and superiorly on the thorax.</p>
              
              <ul>
                <li><strong>Medial end:</strong> Articulates with the sternum</li>
                <li><strong>Lateral end:</strong> Articulates with the acromion of the scapula</li>
                <li><strong>Undersurface:</strong> Site for attachment of the coracoclavicular ligament</li>
              </ul>
              
              <h3><strong>3. Clinical Relevance</strong></h3>
              <ul>
                <li><strong>Fractures:</strong> Fractures of the clavicle are common</li>
                <li><strong>Surface Anatomy:</strong> Easily palpated throughout its length</li>
                <li><strong>Thoracic Outlet:</strong> Forms anterior boundary where nerves and vessels pass</li>
              </ul>
              
              <hr>
              
              <h2>📌 Scapula Bone</h2>
              
              <h3><strong>1. Overview</strong></h3>
              <p>The scapula, commonly known as the shoulder blade, is a flat, triangular bone that lies on the posterior aspect of the thorax.</p>
              
              <h3><strong>2. Key Landmarks</strong></h3>
              <ul>
                <li><strong>Spine:</strong> Prominent subcutaneous projection</li>
                <li><strong>Acromion:</strong> Lateral end of the spine</li>
                <li><strong>Coracoid Process:</strong> Projects upward and forward</li>
                <li><strong>Glenoid Cavity:</strong> Articulates with humerus</li>
              </ul>
              
              <h3><strong>3. Rotator Cuff Muscles (SITS)</strong></h3>
              <ul>
                <li><strong>S</strong>upraspinatus</li>
                <li><strong>I</strong>nfraspinatus</li>
                <li><strong>T</strong>eres minor</li>
                <li><strong>S</strong>ubscapularis</li>
              </ul>
            </div>
          `
        },
        { id: 'upper-limb-joints', name: 'Joints of the Upper Limb', description: 'Shoulder, elbow, wrist, hand joints' },
        { id: 'pectoral-region', name: 'Pectoral Region', description: 'Chest muscles and structures' },
        { id: 'axilla', name: 'Axilla', description: 'Armpit region anatomy' },
        { id: 'brachial-plexus', name: 'Brachial Plexus', description: 'Nerve network supplying upper limb' },
        { id: 'arm-compartments', name: 'Arm Compartments', description: 'Upper arm muscle compartments' },
        { id: 'cubital-fossa', name: 'Cubital Fossa', description: 'Elbow region anatomy' },
        { id: 'forearm-compartments', name: 'Forearm Compartments', description: 'Forearm muscle compartments' },
        { id: 'hand-aspects', name: 'Hand Anatomy', description: 'Hand anatomy and muscles' },
        { id: 'upper-limb-vessels', name: 'Blood Vessels', description: 'Upper limb circulation' },
        { id: 'upper-limb-innervation', name: 'Cutaneous Innervation', description: 'Skin sensation patterns' },
        { id: 'upper-limb-surface', name: 'Surface Anatomy', description: 'Clinical landmarks and examination' }
      ]
    }
  ];

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
  };

  const handleSubtopicSelect = (subtopic: Subtopic) => {
    setSelectedSubtopic(subtopic);
  };

  const handleBack = () => {
    if (selectedSubtopic) {
      setSelectedSubtopic(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  if (selectedSubtopic) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {selectedTopic?.name}
          </Button>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">{selectedSubtopic.name}</h1>
            {selectedSubtopic.description && (
              <p className="text-blue-100">{selectedSubtopic.description}</p>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {selectedSubtopic.content ? (
              <div dangerouslySetInnerHTML={{ __html: selectedSubtopic.content }} />
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Content Coming Soon</h3>
                <p className="text-gray-500">Detailed notes for this subtopic are being prepared.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedTopic) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to {selectedCategory?.name}
          </Button>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">{selectedTopic.name}</h1>
            <p className="text-blue-100">Updated: {selectedTopic.lastUpdated}</p>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-lg max-w-none">
                <p>{selectedTopic.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedTopic.subtopics && selectedTopic.subtopics.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Subtopics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTopic.subtopics.map((subtopic) => (
                <Card
                  key={subtopic.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSubtopicSelect(subtopic)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{subtopic.name}</CardTitle>
                    {subtopic.description && (
                      <CardDescription>{subtopic.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selectedCategory) {
    const filteredTopics = topics.filter(topic => topic.category === selectedCategory.name);
    
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h1 className="text-3xl font-bold mb-2">{selectedCategory.name}</h1>
            <p className="text-blue-100">{selectedCategory.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTopicSelect(topic)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {topic.name}
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    FREE
                  </span>
                </CardTitle>
                <CardDescription>
                  {topic.subtopics ? `${topic.subtopics.length} subtopics` : 'General overview'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {topic.type.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  Updated: {topic.lastUpdated}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">Medical Notes</h1>
          <p className="text-blue-100">Comprehensive study materials for medical education</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          
          return (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleCategorySelect(category)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${category.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {category.name}
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {category.topicCount} topics available
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}