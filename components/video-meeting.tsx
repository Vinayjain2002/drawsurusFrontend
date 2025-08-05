"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, Users, Maximize2, Minimize2 } from "lucide-react"
import type { Player } from "@/app/page"

interface VideoMeetingProps {
  players: Player[]
  currentPlayer: Player
  isExpanded?: boolean
  onToggleExpand?: () => void
}

export default function VideoMeeting({
  players,
  currentPlayer,
  isExpanded = false,
  onToggleExpand,
}: VideoMeetingProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [isAudioEnabled, setIsAudioEnabled] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasPermissions, setHasPermissions] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const requestPermissions = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      setStream(mediaStream)
      setHasPermissions(true)
      setIsVideoEnabled(true)
      setIsAudioEnabled(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Error accessing media devices:", error)
      alert("Could not access camera/microphone. Please check permissions.")
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const disconnectMeeting = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setHasPermissions(false)
    setIsVideoEnabled(false)
    setIsAudioEnabled(false)
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Video Meeting</span>
            <Badge variant="outline" className="text-xs">
              {players.length} players
            </Badge>
          </div>
          {onToggleExpand && (
            <Button size="sm" variant="ghost" onClick={onToggleExpand}>
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasPermissions ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">📹</div>
            <h3 className="text-lg font-semibold mb-2">Join Video Meeting</h3>
            <p className="text-sm text-gray-600 mb-4">Connect with other players via video and audio</p>
            <Button onClick={requestPermissions} className="bg-blue-500 hover:bg-blue-600">
              <Video className="w-4 h-4 mr-2" />
              Enable Camera & Microphone
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Local Video */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full rounded-lg ${isExpanded ? "h-48" : "h-32"} bg-gray-900 object-cover`}
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/50 text-white text-xs">You ({currentPlayer.name})</Badge>
              </div>
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <VideoOff className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Camera Off</p>
                  </div>
                </div>
              )}
            </div>

            {/* Other Players */}
            <div className={`grid ${isExpanded ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
              {players
                .filter((p) => p.id !== currentPlayer.id)
                .map((player) => (
                  <div key={player.id} className="relative">
                    <div
                      className={`${isExpanded ? "h-24" : "h-16"} bg-gray-200 rounded-lg flex items-center justify-center border-2 ${player.isDrawing ? "border-purple-400" : "border-gray-300"}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{player.avatar}</div>
                        <p className="text-xs text-gray-600">{player.name}</p>
                      </div>
                    </div>
                    {player.isDrawing && (
                      <div className="absolute -top-1 -right-1">
                        <Badge className="bg-purple-500 text-xs">Drawing</Badge>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={toggleVideo}
                className="gap-1"
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={toggleAudio}
                className="gap-1"
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={disconnectMeeting} className="gap-1 bg-transparent">
                Leave Meeting
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
