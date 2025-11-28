"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call - in real app, this would save to database
    try {
      // Store feedback in localStorage for demo purposes
      const feedbackData = {
        id: Date.now(),
        rating,
        feedback,
        timestamp: new Date().toISOString(),
        anonymous: true,
      }

      const existingFeedback = JSON.parse(localStorage.getItem("spotfinder_feedback") || "[]")
      existingFeedback.push(feedbackData)
      localStorage.setItem("spotfinder_feedback", JSON.stringify(existingFeedback))

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. It helps us improve the app.",
      })

      // Reset form
      setRating(0)
      setFeedback("")
      onClose()
    } catch (error) {
      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">How would you rate your experience with SpotFinder?</p>

            {/* Star Rating */}
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {rating > 0 && (
                <>
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </>
              )}
            </p>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              placeholder="Tell us what you think about the app, what features you'd like to see, or any issues you've encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Anonymous Notice */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded-md">
            Your feedback is submitted anonymously and helps us improve the app
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
