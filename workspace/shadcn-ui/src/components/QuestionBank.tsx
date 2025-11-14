import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, Download, Upload, BookOpen, CheckCircle, AlertCircle, Eye, RotateCcw } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS } from '@/lib/mockData';

interface QuestionBankProps {
  onBack: () => void;
  onNavigateToCategories?: () => void;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
  verse?: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  usageCount: number;
}

interface QuestionForm {
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  verse: string;
  tags: string[];
}

const BIBLE_CATEGORIES = [
  'Old Testament',
  'New Testament',
  'Genesis',
  'Exodus',
  'Psalms',
  'Proverbs',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  'Revelation'
];

export const QuestionBank: React.FC<QuestionBankProps> = ({ onBack, onNavigateToCategories }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [formData, setFormData] = useState<QuestionForm>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: '',
    difficulty: 'easy',
    explanation: '',
    verse: '',
    tags: []
  });

  useEffect(() => {
    loadQuestions();
  }, [user]);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchTerm, filterCategory, filterDifficulty, filterStatus]);

  const loadQuestions = () => {
    const savedQuestions = storage.get(STORAGE_KEYS.QUESTIONS) || generateMockQuestions();
    setQuestions(savedQuestions);
    storage.set(STORAGE_KEYS.QUESTIONS, savedQuestions);
  };

  const generateMockQuestions = (): Question[] => {
    return [
      {
        id: 'q1',
        text: 'Who was the first man created by God?',
        options: ['Adam', 'Noah', 'Abraham', 'Moses'],
        correctAnswer: 0,
        category: 'Genesis',
        difficulty: 'easy',
        explanation: 'Adam was the first man created by God in the Garden of Eden.',
        verse: 'Genesis 2:7',
        tags: ['creation', 'adam', 'genesis'],
        createdAt: '2024-10-20T10:00:00Z',
        createdBy: 'admin',
        isActive: true,
        usageCount: 15
      },
      {
        id: 'q2',
        text: 'How many days did it take God to create the world?',
        options: ['5 days', '6 days', '7 days', '8 days'],
        correctAnswer: 1,
        category: 'Genesis',
        difficulty: 'easy',
        explanation: 'God created the world in 6 days and rested on the 7th day.',
        verse: 'Genesis 1:31, 2:2',
        tags: ['creation', 'days', 'genesis'],
        createdAt: '2024-10-19T14:30:00Z',
        createdBy: 'admin',
        isActive: true,
        usageCount: 22
      },
      {
        id: 'q3',
        text: 'Who wrote the book of Psalms?',
        options: ['Solomon', 'David', 'Moses', 'Multiple authors'],
        correctAnswer: 3,
        category: 'Psalms',
        difficulty: 'medium',
        explanation: 'The book of Psalms was written by multiple authors, including David, Solomon, and others.',
        verse: 'Psalm 1:1',
        tags: ['psalms', 'authors', 'david'],
        createdAt: '2024-10-18T09:15:00Z',
        createdBy: 'admin',
        isActive: true,
        usageCount: 8
      },
      {
        id: 'q4',
        text: 'What are the fruits of the Spirit mentioned in Galatians?',
        options: [
          'Love, Joy, Peace, Patience, Kindness, Goodness, Faithfulness, Gentleness, Self-control',
          'Faith, Hope, Love',
          'Wisdom, Knowledge, Understanding',
          'Truth, Justice, Mercy'
        ],
        correctAnswer: 0,
        category: 'New Testament',
        difficulty: 'hard',
        explanation: 'The nine fruits of the Spirit are listed in Galatians 5:22-23.',
        verse: 'Galatians 5:22-23',
        tags: ['fruits', 'spirit', 'galatians'],
        createdAt: '2024-10-17T16:45:00Z',
        createdBy: 'admin',
        isActive: true,
        usageCount: 12
      },
      {
        id: 'q5',
        text: 'Who betrayed Jesus Christ?',
        options: ['Peter', 'Judas Iscariot', 'Thomas', 'Matthew'],
        correctAnswer: 1,
        category: 'New Testament',
        difficulty: 'easy',
        explanation: 'Judas Iscariot betrayed Jesus for thirty pieces of silver.',
        verse: 'Matthew 26:14-16',
        tags: ['betrayal', 'judas', 'jesus'],
        createdAt: '2024-10-16T11:20:00Z',
        createdBy: 'admin',
        isActive: false,
        usageCount: 5
      }
    ];
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(q => q.category === filterCategory);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty);
    }

    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(q => q.isActive === isActive);
    }

    setFilteredQuestions(filtered);
  };

  const resetForm = () => {
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      category: '',
      difficulty: 'easy',
      explanation: '',
      verse: '',
      tags: []
    });
    setEditingQuestion(null);
  };

  const handleEdit = (question: Question) => {
    setFormData({
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty,
      explanation: question.explanation || '',
      verse: question.verse || '',
      tags: [...question.tags]
    });
    setEditingQuestion(question);
    setIsAddDialogOpen(true);
  };

  const handlePreview = (question: Question) => {
    setPreviewQuestion(question);
    setIsPreviewDialogOpen(true);
  };

  const handleDelete = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
    }
  };

  const toggleQuestionStatus = (questionId: string) => {
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, isActive: !q.isActive } : q
    );
    setQuestions(updatedQuestions);
    storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim() || !formData.category || formData.options.some(opt => !opt.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    const questionData: Question = {
      id: editingQuestion?.id || `q_${Date.now()}`,
      text: formData.text,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      category: formData.category,
      difficulty: formData.difficulty,
      explanation: formData.explanation,
      verse: formData.verse,
      tags: formData.tags,
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
      createdBy: user?.name || 'Unknown',
      isActive: editingQuestion?.isActive !== undefined ? editingQuestion.isActive : true,
      usageCount: editingQuestion?.usageCount || 0
    };

    if (editingQuestion) {
      const updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? questionData : q
      );
      setQuestions(updatedQuestions);
      storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
    } else {
      const updatedQuestions = [...questions, questionData];
      setQuestions(updatedQuestions);
      storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
    }

    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestions((filteredQuestions || []).map(q => q.id));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  const bulkDelete = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedQuestions.length} selected questions?`)) {
      const updatedQuestions = questions.filter(q => !selectedQuestions.includes(q.id));
      setQuestions(updatedQuestions);
      storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
      setSelectedQuestions([]);
    }
  };

  const bulkToggleStatus = () => {
    if (selectedQuestions.length === 0) {
      alert('Please select questions to update');
      return;
    }

    const updatedQuestions = questions.map(q => 
      selectedQuestions.includes(q.id) ? { ...q, isActive: !q.isActive } : q
    );
    setQuestions(updatedQuestions);
    storage.set(STORAGE_KEYS.QUESTIONS, updatedQuestions);
    setSelectedQuestions([]);
  };

  const exportQuestions = () => {
    const dataStr = JSON.stringify(selectedQuestions.length > 0 
      ? questions.filter(q => selectedQuestions.includes(q.id))
      : (filteredQuestions || []), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getQuestionStats = () => {
    const totalQuestions = questions.length;
    const activeQuestions = questions.filter(q => q.isActive).length;
    const categories = [...new Set(questions.map(q => q.category))].length;
    const averageUsage = questions.length > 0 
      ? Math.round(questions.reduce((sum, q) => sum + q.usageCount, 0) / questions.length)
      : 0;
    
    return { totalQuestions, activeQuestions, categories, averageUsage };
  };

  const stats = getQuestionStats();

  if (!user || !hasPermission(user, 'questions.read')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage the question bank.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
                <p className="text-gray-600">Manage quiz questions and categories</p>
              </div>
            </div>
            {onNavigateToCategories && (
              <Button variant="outline" onClick={onNavigateToCategories}>
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                    <p className="text-sm text-gray-600">Total Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{stats.activeQuestions}</p>
                    <p className="text-sm text-gray-600">Active Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Filter className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{stats.categories}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <RotateCcw className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{stats.averageUsage}</p>
                    <p className="text-sm text-gray-600">Avg Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {BIBLE_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              {selectedQuestions.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={bulkToggleStatus}>
                    Toggle Status ({selectedQuestions.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={bulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedQuestions.length})
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" onClick={exportQuestions}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions ({(filteredQuestions || []).length})</CardTitle>
                <CardDescription>Manage your quiz question database</CardDescription>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllQuestions}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {(filteredQuestions || []).length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No questions found matching your criteria.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredQuestions || []).map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="font-medium truncate">{question.text}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(question.tags || []).slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(question.tags || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(question.tags || []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          question.difficulty === 'easy' ? 'secondary' :
                          question.difficulty === 'medium' ? 'default' : 'destructive'
                        }>
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={question.isActive ? 'default' : 'secondary'}>
                          {question.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{question.usageCount}x</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreview(question)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleQuestionStatus(question.id)}
                            className={question.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {question.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
            <DialogDescription>
              Create or modify quiz questions for your tournaments.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="question-text">Question Text *</Label>
              <Textarea
                id="question-text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your question here..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label>Answer Options *</Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                      className="mt-1"
                    />
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">Select the radio button next to the correct answer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
                <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setFormData(prev => ({ ...prev, difficulty: value }))}>
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
            </div>

            <div>
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Provide an explanation for the correct answer..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="verse">Bible Verse Reference (Optional)</Label>
              <Input
                id="verse"
                value={formData.verse}
                onChange={(e) => setFormData(prev => ({ ...prev, verse: e.target.value }))}
                placeholder="e.g., John 3:16, Genesis 1:1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Enter tags separated by commas (e.g., creation, adam, genesis)"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Question Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
            <DialogDescription>
              Preview how this question will appear in tournaments
            </DialogDescription>
          </DialogHeader>
          
          {previewQuestion && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-4">{previewQuestion.text}</h3>
                
                <div className="space-y-2">
                  {previewQuestion.options.map((option, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded border ${
                        index === previewQuestion.correctAnswer 
                          ? 'bg-green-100 border-green-300' 
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                      {index === previewQuestion.correctAnswer && (
                        <CheckCircle className="inline-block h-4 w-4 ml-2 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Category:</strong> {previewQuestion.category}
                </div>
                <div>
                  <strong>Difficulty:</strong> {previewQuestion.difficulty}
                </div>
                <div>
                  <strong>Usage Count:</strong> {previewQuestion.usageCount}x
                </div>
                <div>
                  <strong>Status:</strong> {previewQuestion.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {previewQuestion.explanation && (
                <div>
                  <strong>Explanation:</strong>
                  <p className="text-sm text-gray-600 mt-1">{previewQuestion.explanation}</p>
                </div>
              )}

              {previewQuestion.verse && (
                <div>
                  <strong>Bible Reference:</strong>
                  <p className="text-sm text-blue-600 mt-1">{previewQuestion.verse}</p>
                </div>
              )}

              {previewQuestion.tags.length > 0 && (
                <div>
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewQuestion.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionBank;