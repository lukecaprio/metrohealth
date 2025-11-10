import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../../api/patient';
import PageLayout from '../../components/layout/PageLayout';
import PatientBottomNav from '../../components/layout/PatientBottomNav';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import { formatDateTime } from '../../utils/formatters';

const Messages: React.FC = () => {
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: patientApi.getMessages,
  });

  const { data: availableStaff, isLoading: staffLoading } = useQuery({
    queryKey: ['availableStaff'],
    queryFn: patientApi.getAvailableStaff,
    enabled: showCompose,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { subject?: string; content: string; receiverId?: string }) => patientApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setShowCompose(false);
      setSubject('');
      setContent('');
      setSelectedStaffId('');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) => 
      patientApi.replyToMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setReplyContent({});
      setExpandedMessageId(null);
    },
  });

  if (isLoading) return <Loading />;

  if (showCompose) {
    return (
      <>
        <PageLayout showBack onBack={() => setShowCompose(false)} title="New Message" className="pb-20">
          <div className="space-y-4">
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To <span className="text-red-600">*</span>
                </label>
                {staffLoading ? (
                  <p className="text-sm text-gray-500">Loading staff...</p>
                ) : (
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
                  >
                    <option value="">Select a doctor or nurse</option>
                    {availableStaff?.map((staff: any) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} - {staff.role === 'PHYSICIAN' ? 'Doctor' : 'Nurse'}
                        {staff.staff?.department && ` (${staff.staff.department})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject (Optional)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Message subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows={6}
                  placeholder="Type your message..."
                />
              </div>
            </div>
          </Card>

          <Button
            onClick={() => sendMutation.mutate({ 
              subject: subject || undefined, 
              content,
              receiverId: selectedStaffId || undefined 
            })}
            disabled={!content || !selectedStaffId || sendMutation.isPending}
            fullWidth
          >
            {sendMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
          </div>
        </PageLayout>
        <PatientBottomNav />
      </>
    );
  }

  return (
    <>
      <PageLayout showBack title="Messages" className="pb-20">
        <div className="space-y-4">
        <Button onClick={() => setShowCompose(true)} fullWidth>
          New Message
        </Button>

        {messages && messages.length > 0 ? (
          messages.map((message) => {
            const isExpanded = expandedMessageId === message.id;
            return (
              <Card key={message.id}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {message.subject || 'No Subject'}
                  </h3>
                  {!message.isRead && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  From: {message.sender.name} ({message.sender.role})
                </p>
                <p className="text-sm text-gray-700 mb-2">{message.content}</p>
                <p className="text-xs text-gray-500 mb-3">{formatDateTime(message.createdAt)}</p>
                
                <Button
                  onClick={() => setExpandedMessageId(isExpanded ? null : message.id)}
                  variant="secondary"
                  fullWidth
                >
                  {isExpanded ? 'Hide Reply' : 'Reply'}
                </Button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Reply
                    </label>
                    <textarea
                      value={replyContent[message.id] || ''}
                      onChange={(e) => setReplyContent({ ...replyContent, [message.id]: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                      rows={4}
                      placeholder="Type your reply..."
                    />
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => {
                          if (replyContent[message.id]) {
                            replyMutation.mutate({ messageId: message.id, content: replyContent[message.id] });
                          }
                        }}
                        disabled={!replyContent[message.id] || replyMutation.isPending}
                        fullWidth
                      >
                        {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                      </Button>
                      <Button
                        onClick={() => {
                          setExpandedMessageId(null);
                          setReplyContent({ ...replyContent, [message.id]: '' });
                        }}
                        variant="secondary"
                        fullWidth
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card>
            <p className="text-center text-gray-600 py-8">No messages yet.</p>
          </Card>
        )}
        </div>
      </PageLayout>
      <PatientBottomNav />
    </>
  );
};

export default Messages;

