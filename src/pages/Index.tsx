import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  category: 'schedule' | 'facility' | 'format' | 'other';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  teacherName?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  extractedTask?: Task;
}

const Index = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Убрать первую пару во вторник',
      description: 'Отменить занятие группы А-101 во вторник в 8:30',
      deadline: '2025-11-19',
      completed: false,
      category: 'schedule',
      priority: 'high',
      createdAt: new Date('2025-11-15T10:30:00')
    },
    {
      id: '2',
      title: 'Освободить актовый зал',
      description: 'Актовый зал должен быть свободен всю следующую неделю для репетиций',
      deadline: '2025-11-18',
      completed: false,
      category: 'facility',
      priority: 'medium',
      createdAt: new Date('2025-11-15T11:00:00')
    }
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Привет! 👋 Отправь мне сообщение от преподавателя, и я создам структурированную задачу.',
      timestamp: new Date()
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeMessage = (message: string, teacher: string): Task => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() - 1);

    const title = teacher 
      ? `${teacher} до ${deadline.toLocaleDateString('ru-RU')}`
      : `Задача до ${deadline.toLocaleDateString('ru-RU')}`;

    return {
      id: Date.now().toString(),
      title,
      description: message,
      deadline: deadline.toISOString().split('T')[0],
      completed: false,
      category: 'other',
      priority: 'medium',
      createdAt: new Date(),
      teacherName: teacher || undefined
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setIsProcessing(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const extractedTask = analyzeMessage(inputMessage, teacherName);
      
      setTasks(prev => [extractedTask, ...prev]);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `✅ Создал задачу: "${extractedTask.title}"\n\nДедлайн: ${new Date(extractedTask.deadline).toLocaleDateString('ru-RU')}`,
        timestamp: new Date(),
        extractedTask
      };

      setMessages(prev => [...prev, botMessage]);
      
      toast({
        title: 'Задача создана!',
        description: extractedTask.title,
      });

      setIsProcessing(false);
      setInputMessage('');
      setTeacherName('');
    }, 800);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'schedule': return 'Calendar';
      case 'facility': return 'Building';
      case 'format': return 'Monitor';
      default: return 'CheckSquare';
    }
  };

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'schedule': return 'bg-blue-100 text-blue-700';
      case 'facility': return 'bg-purple-100 text-purple-700';
      case 'format': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            TaskBot
          </h1>
          <p className="text-muted-foreground text-lg">
            ИИ-помощник для управления задачами
          </p>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Icon name="CheckSquare" size={18} />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Icon name="MessageSquare" size={18} />
              Чат
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={18} />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6 animate-scale-in">
            <div className="grid gap-4">
              <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Icon name="Zap" size={24} className="text-primary" />
                  Активные задачи
                  <Badge variant="secondary">{activeTasks.length}</Badge>
                </h2>
                <div className="space-y-3">
                  {activeTasks.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground text-lg">Нет активных задач</p>
                    </Card>
                  ) : (
                    activeTasks.map((task) => (
                      <Card key={task.id} className="p-5 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskComplete(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{task.title}</h3>
                                <p className="text-muted-foreground text-sm mt-1">
                                  {task.description}
                                </p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={getCategoryColor(task.category)} variant="secondary">
                                <Icon name={getCategoryIcon(task.category)} size={14} className="mr-1" />
                                {task.category === 'schedule' ? 'Расписание' : 
                                 task.category === 'facility' ? 'Помещения' :
                                 task.category === 'format' ? 'Формат' : 'Другое'}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                До {new Date(task.deadline).toLocaleDateString('ru-RU')}
                              </span>
                              {task.teacherName && (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Icon name="User" size={14} />
                                  {task.teacherName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {completedTasks.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                    <Icon name="CheckCircle" size={24} />
                    Выполнено
                    <Badge variant="outline">{completedTasks.length}</Badge>
                  </h2>
                  <div className="space-y-3 opacity-60">
                    {completedTasks.map((task) => (
                      <Card key={task.id} className="p-5">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTaskComplete(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold line-through">{task.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1 line-through">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="animate-scale-in">
            <Card className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-2 block">
                        {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-muted p-4 rounded-2xl">
                      <p className="text-muted-foreground">Анализирую сообщение...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t space-y-3">
                <Input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="ФИО преподавателя (необязательно)"
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Напиши сообщение от преподавателя..."
                    className="resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !inputMessage.trim()}
                    size="icon"
                    className="h-auto"
                  >
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-scale-in">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Icon name="Clock" size={24} className="text-primary" />
                Недавняя активность
              </h2>
              <div className="space-y-4">
                {[...tasks].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map((task) => (
                  <div key={task.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)} mt-1.5`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        {task.completed && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Icon name="CheckCircle2" size={14} className="mr-1" />
                            Выполнено
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Clock" size={14} />
                          Создано: {task.createdAt.toLocaleDateString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="Calendar" size={14} />
                          Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}
                        </span>
                        {task.teacherName && (
                          <span className="flex items-center gap-1">
                            <Icon name="User" size={14} />
                            {task.teacherName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;