'use client';

import { useState } from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setName('');
      setEmail('');
      setMessage('');
      toast.success('Your message has been sent! We will get back to you shortly.');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'Contact' }]} />

      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-black text-foreground">Contact Us</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Have feedback, questions, or want to collaborate? Get in touch with our team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Details Col */}
        <div className="space-y-6 md:col-span-1">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Email Support</h4>
              <p className="text-xs text-muted-foreground mt-1">support@siragii.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Phone Support</h4>
              <p className="text-xs text-muted-foreground mt-1">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Headquarters</h4>
              <p className="text-xs text-muted-foreground mt-1">Chennai, Tamil Nadu, India</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-4 rounded-2xl border border-border/40 p-6 bg-secondary/10">
          <h3 className="text-sm font-bold text-foreground">Send us a direct message</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
            <input
              type="email"
              required
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
            />
          </div>
          <textarea
            required
            rows={5}
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 rounded-xl bg-secondary/35 border border-border/50 text-xs focus:outline-none focus:border-primary/80 text-foreground"
          />
          <button
            type="submit"
            disabled={sending}
            className="h-10 px-5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
