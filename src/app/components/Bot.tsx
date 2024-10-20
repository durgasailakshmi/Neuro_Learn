
"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Course {
  id: number
  course: string
  botName: string
  image: string
}

interface Message {
  text: string
  sender: 'user' | 'bot'
}

const courses: Course[] = [
  { id: 1, course: "Data Visualization", botName: "DataViz", image: "/dataviz-bot.png" },
  { id: 2, course: "Pattern Recognition", botName: "PatternPro", image: "/patternpro-bot.png" },
  { id: 3, course: "Block Chain", botName: "ChainMaster", image: "/chainmaster-bot.png" }
]

const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const Bot: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course)
    setMessages([{ text: `Hello! I'm ${course.botName}, your ${course.course} assistant. How can I help you today?`, sender: 'bot' }])
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() === '') return

    const newMessages = [
      ...messages,
      { text: input, sender: 'user' as const },
      { text: `You asked about ${input} in the context of ${selectedCourse?.course}. Here's a placeholder response from ${selectedCourse?.botName}.`, sender: 'bot' as const }
    ]
    setMessages(newMessages)
    setInput('')
  }

  return (
    <div className="min-h-screen bg-black text-white py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-gray-900 shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold mb-8 text-center text-yellow-400">Neuro Learn</h1>
          {!selectedCourse ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  className="bg-gray-800 rounded-lg p-6 text-white cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="flex justify-center mb-4">
                    <Image src={course.image} alt={`${course.botName} icon`} width={64} height={64} />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-center text-yellow-400">{course.botName}</h2>
                  <p className="text-sm text-center">{course.course} Assistant</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex items-center mb-6">
                <RobotIcon className="w-8 h-8 text-yellow-400 mr-2" />
                <h2 className="text-2xl font-semibold text-yellow-400">{selectedCourse.botName}</h2>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-yellow-400 text-black'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      {message.text}
                    </span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow mr-2 p-2 border rounded bg-gray-800 text-white"
                  placeholder="Type your message..."
                />
                <motion.button
                  type="submit"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send
                </motion.button>
              </form>
              <motion.button
                onClick={() => setSelectedCourse(null)}
                className="mt-4 text-yellow-400 hover:text-yellow-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Chatbot Selection
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Bot;