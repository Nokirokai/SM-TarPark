import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Search, HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'How do I park at SM TarPark?',
        a: 'Drive to the entrance, where toll personnel will scan your plate number. You\'ll be assigned a parking slot automatically. Park in your assigned slot and remember the zone and number.'
      },
      {
        q: 'What are the parking rates?',
        a: 'Parking is ₱20 per hour. First 30 minutes are free. Maximum daily rate is ₱200.'
      },
      {
        q: 'How do I pay for parking?',
        a: 'At exit, scan your plate again. You can pay via GCash QR code, cash, or card at the toll booth.'
      }
    ]
  },
  {
    category: 'Credit Score',
    questions: [
      {
        q: 'What is the credit score system?',
        a: 'Credit score tracks your parking behavior. You start at 100 points. Violations deduct points. Negative scores result in entry blocking until fines are paid.'
      },
      {
        q: 'How do I improve my credit score?',
        a: 'Pay any outstanding violations, park properly, and avoid overstays. Each successful parking session maintains your score.'
      }
    ]
  },
  {
    category: 'Violations',
    questions: [
      {
        q: 'What happens if I overstay?',
        a: 'Overstaying 4+ hours without payment results in a ₱500 fine plus ₱20 per additional hour. Your credit score is reduced by -10 points.'
      },
      {
        q: 'How do I pay a violation fine?',
        a: 'Log into your profile or visit the toll booth. Fines can be paid via GCash, cash, or card. Payment restores 10 credit points.'
      }
    ]
  },
  {
    category: 'Technical Support',
    questions: [
      {
        q: 'My plate wasn\'t recognized at entry',
        a: 'Contact the toll personnel immediately. They can manually enter your plate and assign a slot. Ensure your plate is clean and visible.'
      },
      {
        q: 'I lost my parking slip',
        a: 'Don\'t worry! We use digital plate scanning. Your plate number is your reference. Show your plate at exit.'
      }
    ]
  }
];

export function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="mb-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white backdrop-blur"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Help Center</h1>
          <p className="text-blue-100 text-lg">Find answers to common questions</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <Card>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">🚗</span>
              <h3 className="font-semibold text-gray-900">How to Park</h3>
              <p className="text-sm text-gray-600 mt-1">Step-by-step guide</p>
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">💰</span>
              <h3 className="font-semibold text-gray-900">Rates & Payment</h3>
              <p className="text-sm text-gray-600 mt-1">Pricing information</p>
            </div>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">📞</span>
              <h3 className="font-semibold text-gray-900">Contact Support</h3>
              <p className="text-sm text-gray-600 mt-1">Get help now</p>
            </div>
          </Card>
        </div>

        {/* FAQs */}
        {faqs.map((category, catIndex) => (
          <Card key={category.category}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-800" />
              {category.category}
            </h2>
            <div className="space-y-3">
              {category.questions.map((faq, qIndex) => {
                const itemId = `${catIndex}-${qIndex}`;
                const isExpanded = expandedItems.has(itemId);

                return (
                  <div key={itemId} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-gray-600">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {/* Contact Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-center py-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">Our support team is here to assist you</p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <strong>Email:</strong> support@smtarlac.com
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> +63 (045) 123-4567
              </p>
              <p className="text-gray-700">
                <strong>Hours:</strong> 7 AM - 10 PM Daily
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">
                © 2026 SM Tarlac. All rights reserved.
              </p>
              <p className="text-xs text-gray-500">
                Website by Angel Bitangcol
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button className="hover:text-blue-800">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-blue-800">Terms of Service</button>
              <span>•</span>
              <button className="hover:text-blue-800">Contact Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
