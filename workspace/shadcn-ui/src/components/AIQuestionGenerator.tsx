import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Zap, RefreshCw, Download, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Question, BIBLE_CATEGORIES } from '@/lib/mockData';

interface AIQuestionGeneratorProps {
  onBack: () => void;
}

interface GenerationSettings {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  topic: string;
  includeVerses: boolean;
  includeExplanations: boolean;
}

export const AIQuestionGenerator: React.FC<AIQuestionGeneratorProps> = ({ onBack }) => {
  const { user, tenant } = useAuth();
  const [settings, setSettings] = useState<GenerationSettings>({
    category: '',
    difficulty: 'medium',
    count: 10,
    topic: '',
    includeVerses: true,
    includeExplanations: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const aiQuestionTemplates = [
    {
      category: 'Old Testament',
      questions: [
        {
          text: 'Who was the first king of Israel?',
          options: ['Saul', 'David', 'Solomon', 'Samuel'],
          correctAnswer: 0,
          explanation: 'Saul was anointed as the first king of Israel by the prophet Samuel.',
          verse: '1 Samuel 10:1'
        },
        {
          text: 'How many days and nights did it rain during the flood?',
          options: ['30', '40', '50', '60'],
          correctAnswer: 1,
          explanation: 'It rained for 40 days and 40 nights during the great flood.',
          verse: 'Genesis 7:12'
        },
        {
          text: 'What did God use to destroy Sodom and Gomorrah?',
          options: ['Flood', 'Fire and brimstone', 'Earthquake', 'Plague'],
          correctAnswer: 1,
          explanation: 'God destroyed Sodom and Gomorrah with fire and brimstone from heaven.',
          verse: 'Genesis 19:24'
        }
      ]
    },
    {
      category: 'New Testament',
      questions: [
        {
          text: 'How many apostles did Jesus choose?',
          options: ['10', '11', '12', '13'],
          correctAnswer: 2,
          explanation: 'Jesus chose 12 apostles to be his closest disciples.',
          verse: 'Matthew 10:1-4'
        },
        {
          text: 'Where was Jesus born?',
          options: ['Nazareth', 'Jerusalem', 'Bethlehem', 'Capernaum'],
          correctAnswer: 2,
          explanation: 'Jesus was born in Bethlehem, as prophesied in the Old Testament.',
          verse: 'Matthew 2:1'
        },
        {
          text: 'Who baptized Jesus?',
          options: ['Peter', 'John the Baptist', 'Andrew', 'James'],
          correctAnswer: 1,
          explanation: 'John the Baptist baptized Jesus in the Jordan River.',
          verse: 'Matthew 3:13-17'
        }
      ]
    },
    {
      category: 'Gospels',
      questions: [
        {
          text: 'Which Gospel was written by a doctor?',
          options: ['Matthew', 'Mark', 'Luke', 'John'],
          correctAnswer: 2,
          explanation: 'Luke was a physician and wrote the Gospel of Luke.',
          verse: 'Colossians 4:14'
        },
        {
          text: 'How many loaves and fishes did Jesus use to feed the 5000?',
          options: ['3 loaves, 1 fish', '5 loaves, 2 fish', '7 loaves, 3 fish', '2 loaves, 5 fish'],
          correctAnswer: 1,
          explanation: 'Jesus used 5 loaves and 2 fish to feed the multitude of 5000.',
          verse: 'Matthew 14:17-21'
        }
      ]
    },
    {
      category: 'Psalms & Proverbs',
      questions: [
        {
          text: 'Who wrote most of the Psalms?',
          options: ['Solomon', 'David', 'Moses', 'Asaph'],
          correctAnswer: 1,
          explanation: 'King David wrote the majority of the Psalms in the Bible.',
          verse: 'Psalm 1:1'
        },
        {
          text: 'Complete this verse: "Trust in the Lord with all your heart and..."',
          options: ['lean on your own understanding', 'lean not on your own understanding', 'follow your heart', 'seek wisdom'],
          correctAnswer: 1,
          explanation: 'This is from Proverbs 3:5, teaching us to trust God rather than our own wisdom.',
          verse: 'Proverbs 3:5'
        }
      ]
    }
  ];

  const generateQuestions = async () => {
    if (!settings.category) {
      alert('Please select a category');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedQuestions([]);

    // Simulate AI generation with progress
    const totalSteps = settings.count;
    const questions: Question[] = [];

    for (let i = 0; i < totalSteps; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get template questions for the category
      const categoryTemplate = aiQuestionTemplates.find(t => t.category === settings.category);
      const templateQuestions = categoryTemplate?.questions || aiQuestionTemplates[0].questions;
      
      // Select a random template question
      const template = templateQuestions[Math.floor(Math.random() * templateQuestions.length)];
      
      // Create variations of the template
      const variations = [
        template,
        { ...template, text: template.text.replace(/\b\w+\b/, 'which') },
        { ...template, text: `In the Bible, ${template.text.toLowerCase()}` }
      ];
      
      const selectedTemplate = variations[Math.floor(Math.random() * variations.length)];
      
      const question: Question = {
        id: `ai_q_${Date.now()}_${i}`,
        text: selectedTemplate.text,
        options: [...selectedTemplate.options].sort(() => Math.random() - 0.5), // Shuffle options
        correctAnswer: selectedTemplate.options.indexOf(selectedTemplate.options[selectedTemplate.correctAnswer]),
        category: settings.category,
        difficulty: settings.difficulty,
        source: 'ai',
        explanation: settings.includeExplanations ? selectedTemplate.explanation : '',
        verse: settings.includeVerses ? selectedTemplate.verse : '',
        tenantId: user?.tenantId || 'tenant1'
      };

      // Fix correct answer index after shuffling
      question.correctAnswer = question.options.indexOf(selectedTemplate.options[selectedTemplate.correctAnswer]);
      
      questions.push(question);
      setProgress(((i + 1) / totalSteps) * 100);
      setGeneratedQuestions([...questions]);
    }

    setIsGenerating(false);
  };

  const saveSelectedQuestions = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question to save');
      return;
    }

    const questionsToSave = generatedQuestions.filter(q => selectedQuestions.includes(q.id));
    const allQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || [];
    
    allQuestions.push(...questionsToSave);
    storage.set(STORAGE_KEYS.QUESTIONS, allQuestions);

    alert(`${questionsToSave.length} questions saved successfully!`);
    setGeneratedQuestions([]);
    setSelectedQuestions([]);
  };

  const exportQuestions = () => {
    const questionsToExport = selectedQuestions.length > 0 
      ? generatedQuestions.filter(q => selectedQuestions.includes(q.id))
      : generatedQuestions;

    const dataStr = JSON.stringify(questionsToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-questions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestions(generatedQuestions.map(q => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  if (!user || !['org_admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to use the AI Question Generator.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Question Generator</h1>
              <p className="text-gray-600">Generate Bible quiz questions using AI assistance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>Generation Settings</span>
                </CardTitle>
                <CardDescription>Configure AI question generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={settings.category} onValueChange={(value) => setSettings(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIBLE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={settings.difficulty} onValueChange={(value) => setSettings(prev => ({ ...prev, difficulty: value as 'easy' | 'medium' | 'hard' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="count">Number of Questions</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.count}
                    onChange={(e) => setSettings(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                  />
                </div>

                <div>
                  <Label htmlFor="topic">Specific Topic (Optional)</Label>
                  <Input
                    id="topic"
                    value={settings.topic}
                    onChange={(e) => setSettings(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Creation, Miracles, Parables"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-verses"
                      checked={settings.includeVerses}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeVerses: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="include-verses">Include Bible verse references</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="include-explanations"
                      checked={settings.includeExplanations}
                      onChange={(e) => setSettings(prev => ({ ...prev, includeExplanations: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="include-explanations">Include answer explanations</Label>
                  </div>
                </div>

                <Button 
                  onClick={generateQuestions} 
                  disabled={isGenerating || !settings.category}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Questions
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generated Questions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Generated Questions</CardTitle>
                    <CardDescription>
                      {generatedQuestions.length > 0 && `${generatedQuestions.length} questions generated`}
                    </CardDescription>
                  </div>
                  
                  {generatedQuestions.length > 0 && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllQuestions}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        Clear
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportQuestions}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" onClick={saveSelectedQuestions}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Selected
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedQuestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No questions generated yet. Configure settings and click "Generate Questions" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((question, index) => (
                      <div 
                        key={question.id} 
                        className={`p-4 border rounded-lg ${
                          selectedQuestions.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">Question {index + 1}</Badge>
                              <div className="flex space-x-2">
                                <Badge variant={question.difficulty === 'easy' ? 'secondary' : question.difficulty === 'medium' ? 'default' : 'destructive'}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline">{question.category}</Badge>
                              </div>
                            </div>
                            
                            <h4 className="font-medium mb-2">{question.text}</h4>
                            
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              {question.options.map((option, optionIndex) => (
                                <div 
                                  key={optionIndex}
                                  className={`p-2 text-sm rounded ${
                                    optionIndex === question.correctAnswer 
                                      ? 'bg-green-100 text-green-800 font-medium' 
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            
                            {question.explanation && (
                              <p className="text-sm text-gray-600 mb-1">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                            
                            {question.verse && (
                              <p className="text-sm text-blue-600">
                                <strong>Reference:</strong> {question.verse}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};