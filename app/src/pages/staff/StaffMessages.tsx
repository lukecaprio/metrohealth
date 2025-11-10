import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../api/staff';
import PageLayout from '../../components/layout/PageLayout';
import BottomNav from '../../components/layout/BottomNav';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDateTime } from '../../utils/formatters';

const StaffMessages: React.FC = () => {
  const [showCompose, setShowCompose] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  
  // Compose form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const queryClient = useQueryClient();

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['staffMessages'],
    queryFn: staffApi.getMessages,
  });

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: staffApi.getPatients,
  });

  const sendMutation = useMutation({
    mutationFn: (data: { patientId: string; subject?: string; content: string }) =>
      staffApi.sendMessage(data.patientId, { subject: data.subject, content: data.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMessages'] });
      setShowCompose(false);
      setSelectedPatientId('');
      setSubject('');
      setContent('');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      staffApi.replyToMessage(messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffMessages'] });
      setReplyContent({});
      setExpandedMessageId(null);
    },
  });

  const handleSend = () => {
    if (selectedPatientId && content.trim()) {
      sendMutation.mutate({ patientId: selectedPatientId, subject, content });
    }
  };

  if (messagesLoading) return <Loading />;

  // Compose new message view
  if (showCompose) {
    return (
      <>
        <PageLayout showBack onBack={() => setShowCompose(false)} title="New Message to Patient" className="pb-20">
          <Card>
            <div className="space-y-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To (Patient) *
                </label>
                {patientsLoading ? (
                  <p className="text-sm text-gray-500">Loading patients...</p>
                ) : (
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients?.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - Room {patient.roomNumber || 'N/A'} ({patient.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., Test Results Available"
                />
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                  rows={6}
                  placeholder="Type your message to the patient..."
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSend}
                  disabled={!selectedPatientId || !content.trim() || sendMutation.isPending}
                  fullWidth
                >
                  {sendMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button onClick={() => setShowCompose(false)} variant="secondary" fullWidth>
                  Cancel
                </Button>
              </div>

              {sendMutation.isError && (
                <p className="text-sm text-red-600">Failed to send message. Please try again.</p>
              )}
            </div>
          </Card>
        </PageLayout>
        <BottomNav />
      </>
    );
  }

  // Messages list view with reply functionality
  return (
    <>
      <PageLayout showBack title="Messages" className="pb-20">
        <div className="space-y-4">
          <Button onClick={() => setShowCompose(true)} fullWidth>
            New Message to Patient
          </Button>

          {messages && messages.length > 0 ? (
            messages.map((message) => {
              const isExpanded = expandedMessageId === message.id;
              return (
                <Card key={message.id}>
                  <div className="space-y-3">
                    {/* Message Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {message.subject || 'No Subject'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          From: {message.sender?.name || 'Unknown'} ({message.sender?.role || 'N/A'})
                        </p>
                      </div>
                      {!message.isRead && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                          New
                        </span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        Received: {formatDateTime(message.createdAt)}
                      </p>
                    </div>

                    {/* Reply Button */}
                    <Button
                      onClick={() => setExpandedMessageId(isExpanded ? null : message.id)}
                      variant="secondary"
                      fullWidth
                    >
                      {isExpanded ? 'Hide Reply' : 'Reply to Patient'}
                    </Button>

                    {/* Reply Form */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Reply
                        </label>
                        <textarea
                          value={replyContent[message.id] || ''}
                          onChange={(e) =>
                            setReplyContent({ ...replyContent, [message.id]: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                          rows={4}
                          placeholder="Type your reply to the patient..."
                        />
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => {
                              if (replyContent[message.id]) {
                                replyMutation.mutate({
                                  messageId: message.id,
                                  content: replyContent[message.id],
                                });
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
                  </div>
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
      <BottomNav />
    </>
  );
};

export default StaffMessages;

