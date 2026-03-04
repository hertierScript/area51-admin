"use client";

import { useEffect, useRef, useState } from "react";
import { Order } from "@/types/database";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Play bell.mp3 sound - with proper autoplay handling
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    } catch (e) {
      console.error("Failed to create audio context:", e);
      return null;
    }
  }
  return audioContext;
}

function playBellSound() {
  const audio = new Audio("/bell.mp3");
  audio.volume = 0.8;

  audio.play().catch(async () => {
    console.log("HTML5 audio failed, trying AudioContext...");
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        await ctx.resume();
      }
      const response = await fetch("/bell.mp3");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx!.decodeAudioData(arrayBuffer);
      const source = ctx!.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx!.destination);
      source.start(0);
    } catch (err) {
      console.error("Failed to play bell sound with AudioContext:", err);
    }
  });
}

function playOrderNotification() {
  playBellSound();
}

export default function OrderNotification() {
  const lastOrderIdsRef = useRef<Set<string>>(new Set());
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);

  // Initialize audio on user interaction
  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = getAudioContext();
        if (ctx && ctx.state === "suspended") {
          await ctx.resume();
        }
      } catch (e) {
        console.log("Audio initialization deferred");
      }
    };

    const handleInteraction = () => {
      initAudio();
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Fetch orders and check for new ones
  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      if (!isEnabled) return;

      try {
        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!response.ok || !isMounted) return;

        const orders: Order[] = result.data || [];
        const newOrderIds = new Set<string>(orders.map((o) => o.id));
        const previousOrderIds = lastOrderIdsRef.current;

        // Check for new orders
        if (previousOrderIds.size > 0) {
          const newCount = orders.filter(
            (order) => !previousOrderIds.has(order.id),
          ).length;

          if (newCount > 0) {
            console.log("New orders detected globally:", newCount);

            // Ensure audio context is ready
            const ctx = getAudioContext();
            if (ctx && ctx.state === "suspended") {
              ctx.resume().then(() => playOrderNotification());
            } else {
              playOrderNotification();
            }

            setNewOrdersCount((prev) => prev + newCount);
            toast.success(
              `${newCount} new order${newCount > 1 ? "s" : ""} received!`,
              {
                duration: 5000,
              },
            );
          }
        }

        // Update tracked IDs
        lastOrderIdsRef.current = newOrderIds;
      } catch (err) {
        // Silent fail
      }
    }

    // Initial fetch
    fetchOrders();

    // Set up interval
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isEnabled]);

  // Test sound function
  const testSound = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().then(() => playOrderNotification());
    } else {
      playOrderNotification();
    }
    toast.info("Test sound played!", { duration: 2000 });
  };

  // Don't render anything initially - only show when there are new orders
  // The useEffect keeps running in background to detect new orders
  if (newOrdersCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        onClick={() => {
          setNewOrdersCount(0);
          fetch("/api/orders").then(async (res) => {
            const result = await res.json();
            const orders: Order[] = result.data || [];
            lastOrderIdsRef.current = new Set<string>(orders.map((o) => o.id));
          });
        }}
        className="border-yellow-500/50 text-yellow-500 bg-background shadow-lg"
      >
        <Bell className="h-4 w-4 mr-2" />
        {newOrdersCount} new order{newOrdersCount > 1 ? "s" : ""}
      </Button>
    </div>
  );
}

// Export test sound for testing button
export function testGlobalSound() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().then(() => playOrderNotification());
  } else {
    playOrderNotification();
  }
}
