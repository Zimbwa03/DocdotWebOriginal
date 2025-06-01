import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image, CheckCircle, XCircle } from "lucide-react";

interface QuizQuestionProps {
  question: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    imageUrl?: string;
    questionType?: 'text' | 'image' | 'cadaver' | 'histology';
    difficulty?: 'easy' | 'medium' | 'hard';
  };
  selectedAnswer?: string;
  onAnswerSelect?: (answer: string) => void;
  onAnswer?: (isCorrect: boolean) => void;
  showExplanation?: boolean;
}

export default function QuizQuestion({ 
  question, 
  selectedAnswer = '', 
  onAnswerSelect, 
  onAnswer,
  showExplanation = false 
}: QuizQuestionProps) {
  const isCorrect = selectedAnswer === question.correctAnswer;
  
  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'cadaver':
        return 'bg-red-100 text-red-800';
      case 'histology':
        return 'bg-purple-100 text-purple-800';
      case 'image':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {question.questionType && (
                <Badge className={getQuestionTypeColor(question.questionType)}>
                  {question.questionType === 'cadaver' && 'Anatomy Cadaver'}
                  {question.questionType === 'histology' && 'Histology Slide'}
                  {question.questionType === 'image' && 'Image-Based'}
                  {question.questionType === 'text' && 'Text-Based'}
                </Badge>
              )}
              {question.difficulty && (
                <Badge className={getDifficultyColor(question.difficulty)}>
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </Badge>
              )}
            </div>
            {question.imageUrl && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Image size={16} />
                <span>Image Question</span>
              </div>
            )}
          </div>

          {/* Question Image */}
          {question.imageUrl && (
            <div className="w-full max-w-2xl mx-auto">
              <img 
                src={question.imageUrl} 
                alt="Question image"
                className="w-full h-auto rounded-lg border shadow-sm"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
          )}

          {/* Question Text */}
          <div className="text-lg font-medium text-gray-900">
            {question.question}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === question.correctAnswer;
              
              let buttonStyle = "w-full text-left p-4 rounded-lg border transition-all duration-200 ";
              
              if (showExplanation) {
                if (isCorrectOption) {
                  buttonStyle += "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrectOption) {
                  buttonStyle += "border-red-500 bg-red-50 text-red-900";
                } else {
                  buttonStyle += "border-gray-200 bg-gray-50 text-gray-700";
                }
              } else {
                if (isSelected) {
                  buttonStyle += "border-blue-500 bg-blue-50 text-blue-900";
                } else {
                  buttonStyle += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                }
              }

              return (
                <button
                  key={index}
                  className={buttonStyle}
                  onClick={() => {
                    if (!showExplanation) {
                      if (onAnswerSelect) {
                        onAnswerSelect(option);
                      }
                      if (onAnswer) {
                        onAnswer(option === question.correctAnswer);
                      }
                    }
                  }}
                  disabled={showExplanation}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {showExplanation && (
                      <div>
                        {isCorrectOption && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {isSelected && !isCorrectOption && <XCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
              <p className="text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}