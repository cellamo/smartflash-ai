'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function TestEmail() {
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [helloResponse, setHelloResponse] = useState('');

  const sendTestEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          username: username,
        }),
      });

      if (response.ok) {
        toast.success('Welcome email sent successfully!');
      } else {
        toast.error('Failed to send welcome email');
      }
    } catch (error) {
      toast.error('An error occurred while sending the email');
    }
    setIsSending(false);
  };

  const getHello = async () => {
    try {
      const response = await fetch('/api/hello');
      if (response.ok) {
        const data = await response.json();
        setHelloResponse(JSON.stringify(data));
      } else {
        setHelloResponse('Failed to fetch hello response');
      }
    } catch (error) {
      setHelloResponse('An error occurred while fetching hello response');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Welcome Email</h1>
      <Input
        type="email"
        placeholder="Recipient Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2"
      />
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2"
      />
      <Button onClick={sendTestEmail} disabled={isSending} className="mb-2">
        {isSending ? 'Sending...' : 'Send Welcome Email'}
      </Button>
      <Button onClick={getHello} className="mb-2">
        Get Hello
      </Button>
      {helloResponse && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Hello Response:</h2>
          <pre>{helloResponse}</pre>
        </div>
      )}
    </div>
  );
}
