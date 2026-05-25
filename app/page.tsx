"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GroupMatchView } from "@/components/GroupMatchView";
import { HomeView } from "@/components/HomeView";
import { InterviewView } from "@/components/InterviewView";
import { NegotiationView } from "@/components/NegotiationView";
import { PeopleMatchView } from "@/components/PeopleMatchView";
import { PersonaResultView } from "@/components/PersonaResultView";
import { PersonaSeedView } from "@/components/PersonaSeedView";
import { PersonaTestView } from "@/components/PersonaTestView";
import { ProfileView } from "@/components/ProfileView";
import { RealmFeedView } from "@/components/RealmFeedView";
import { RightPanel } from "@/components/RightPanel";
import { usePersonalityTest } from "@/hooks/usePersonalityTest";
import type { DemoView } from "@/lib/demo-types";
import type { GroupMatchResponse } from "@/lib/group-match-schema";
import type { NegotiationResponse } from "@/lib/negotiation-schema";
import type { PersonMatchResponse } from "@/lib/person-match-schema";
import type {
  UserNeedProfile,
  UserProfileExtractRequest,
  UserProfileExtractResponse,
} from "@/lib/profile-schema";
import type { RealmRecommendationResponse } from "@/lib/realm-recommendation-schema";
import type {
  AgentRespondRequest,
  AgentRespondResponse,
  ChatMessage,
} from "@/lib/types";

const USER_AGENT_SOFT_LIMIT = 5;
const PROFILE_READY_MARKER = "【画像可生成】";

function stripProfileReadyMarker(content: string) {
  return content.replaceAll(PROFILE_READY_MARKER, "").trim();
}

export default function Home() {
  const [activeView, setActiveView] = useState<DemoView>("home");
  const personality = usePersonalityTest();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserNeedProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [groupMatchResponse, setGroupMatchResponse] =
    useState<GroupMatchResponse | null>(null);
  const [groupMatchLoading, setGroupMatchLoading] = useState(false);
  const [groupMatchError, setGroupMatchError] = useState<string | null>(null);
  const [peopleMatchResponse, setPeopleMatchResponse] =
    useState<PersonMatchResponse | null>(null);
  const [peopleMatchLoading, setPeopleMatchLoading] = useState(false);
  const [peopleMatchError, setPeopleMatchError] = useState<string | null>(null);
  const [realmResponse, setRealmResponse] =
    useState<RealmRecommendationResponse | null>(null);
  const [realmLoading, setRealmLoading] = useState(false);
  const [realmError, setRealmError] = useState<string | null>(null);
  const [negotiationResponse, setNegotiationResponse] =
    useState<NegotiationResponse | null>(null);
  const [negotiationLoading, setNegotiationLoading] = useState(false);
  const [negotiationError, setNegotiationError] = useState<string | null>(null);
  const [negotiatingTargetId, setNegotiatingTargetId] = useState<string | null>(
    null,
  );
  const [continueInterview, setContinueInterview] = useState(false);
  const [profileReadyByAgent, setProfileReadyByAgent] = useState(false);

  const userRoundCount = messages.filter((message) => message.role === "user")
    .length;
  const isInterviewReady =
    (userRoundCount >= USER_AGENT_SOFT_LIMIT || profileReadyByAgent) &&
    !profile &&
    !continueInterview &&
    !isLoading;

  async function submitUserMessage(messageText?: string) {
    const trimmedInput = (messageText ?? input).trim();
    if (!trimmedInput || isLoading || isInterviewReady) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedInput },
    ];
    const previousMessages = messages;

    setActiveView("interview");
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);
    setProfileReadyByAgent(false);
    setProfile(null);
    setProfileError(null);
    setGroupMatchResponse(null);
    setGroupMatchError(null);
    setPeopleMatchResponse(null);
    setPeopleMatchError(null);
    setRealmResponse(null);
    setRealmError(null);
    setNegotiationResponse(null);
    setNegotiationError(null);
    setNegotiatingTargetId(null);

    try {
      const requestBody: AgentRespondRequest = {
        agentId: "user_agent",
        messages: nextMessages,
      };

      const response = await fetch("/api/agent/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as
        | AgentRespondResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "请求失败");
      }

      const assistantContent = "content" in data ? data.content : "";
      const assistantMarkedReady =
        assistantContent.includes(PROFILE_READY_MARKER);
      const displayAssistantContent =
        stripProfileReadyMarker(assistantContent) ||
        "画像信息已经清晰，可以生成用户画像。";

      setProfileReadyByAgent(assistantMarkedReady);
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: displayAssistantContent,
        },
      ]);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "请求失败";
      setError(message);
      setMessages(previousMessages);
      setInput(trimmedInput);
    } finally {
      if (continueInterview) {
        setContinueInterview(false);
      }
      setIsLoading(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setInput("");
    setError(null);
    setProfile(null);
    setProfileError(null);
    setGroupMatchResponse(null);
    setGroupMatchError(null);
    setPeopleMatchResponse(null);
    setPeopleMatchError(null);
    setRealmResponse(null);
    setRealmError(null);
    setNegotiationResponse(null);
    setNegotiationError(null);
    setNegotiatingTargetId(null);
    setContinueInterview(false);
    setProfileReadyByAgent(false);
    setActiveView("home");
  }

  function handleContinueInterview() {
    setContinueInterview(true);
    setProfileReadyByAgent(false);
    setInput("");
  }

  async function handleGenerateProfile() {
    if (messages.length === 0 || profileLoading) return;

    setProfileLoading(true);
    setProfileError(null);

    try {
      const requestBody: UserProfileExtractRequest = {
        messages,
      };

      const response = await fetch("/api/agent/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = (await response.json()) as
        | UserProfileExtractResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "画像抽取失败");
      }

      if (!("profile" in data)) {
        throw new Error("画像抽取失败");
      }

      setProfile(data.profile);
      setGroupMatchResponse(null);
      setGroupMatchError(null);
      setPeopleMatchResponse(null);
      setPeopleMatchError(null);
      setRealmResponse(null);
      setRealmError(null);
      setNegotiationResponse(null);
      setNegotiationError(null);
      setNegotiatingTargetId(null);
      setContinueInterview(false);
      setProfileReadyByAgent(false);
      setActiveView("profile");
    } catch (profileSubmitError) {
      const message =
        profileSubmitError instanceof Error
          ? profileSubmitError.message
          : "画像抽取失败";
      setProfileError(message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleMatchGroups() {
    if (!profile || groupMatchLoading) return;

    setActiveView("group_match");
    setGroupMatchLoading(true);
    setGroupMatchError(null);

    try {
      const response = await fetch("/api/match/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          soulProfile: personality.finalProfile,
        }),
      });

      const data = (await response.json()) as
        | GroupMatchResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "群匹配失败");
      }

      if (!("result" in data)) {
        throw new Error("群匹配失败");
      }

      setGroupMatchResponse(data);
      setNegotiationResponse(null);
      setNegotiationError(null);
    } catch (matchError) {
      const message =
        matchError instanceof Error ? matchError.message : "群匹配失败";
      setGroupMatchError(message);
    } finally {
      setGroupMatchLoading(false);
    }
  }

  async function handleMatchPeople() {
    if (!profile || peopleMatchLoading) return;

    setActiveView("people_match");
    setPeopleMatchLoading(true);
    setPeopleMatchError(null);

    try {
      const response = await fetch("/api/match/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          soulProfile: personality.finalProfile,
        }),
      });

      const data = (await response.json()) as
        | PersonMatchResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "人物匹配失败");
      }

      if (!("result" in data)) {
        throw new Error("人物匹配失败");
      }

      setPeopleMatchResponse(data);
      setNegotiationResponse(null);
      setNegotiationError(null);
    } catch (matchError) {
      const message =
        matchError instanceof Error ? matchError.message : "人物匹配失败";
      setPeopleMatchError(message);
    } finally {
      setPeopleMatchLoading(false);
    }
  }

  async function handleRecommendRealm() {
    if (!profile || realmLoading) return;

    setActiveView("realm_feed");
    setRealmLoading(true);
    setRealmError(null);

    try {
      const response = await fetch("/api/realm/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          soulProfile: personality.finalProfile,
        }),
      });

      const data = (await response.json()) as
        | RealmRecommendationResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "群域推荐失败");
      }

      if (!("result" in data)) {
        throw new Error("群域推荐失败");
      }

      setRealmResponse(data);
      setNegotiationResponse(null);
      setNegotiationError(null);
    } catch (realmSubmitError) {
      const message =
        realmSubmitError instanceof Error
          ? realmSubmitError.message
          : "群域推荐失败";
      setRealmError(message);
    } finally {
      setRealmLoading(false);
    }
  }

  async function handleNegotiateGroup(groupId: string) {
    await negotiate({
      targetType: "group",
      targetId: groupId,
      source: "group_match",
      contentId: null,
    });
  }

  async function handleNegotiatePerson(personId: string) {
    await negotiate({
      targetType: "person",
      targetId: personId,
      source: "people_match",
      contentId: null,
    });
  }

  async function handleNegotiateGroupFromContent(
    groupId: string,
    contentId: string,
  ) {
    await negotiate({
      targetType: "group",
      targetId: groupId,
      source: "realm_content",
      contentId,
    });
  }

  async function handleNegotiatePersonFromContent(
    personId: string,
    contentId: string,
  ) {
    await negotiate({
      targetType: "person",
      targetId: personId,
      source: "realm_content",
      contentId,
    });
  }

  async function negotiate({
    targetType,
    targetId,
    source,
    contentId,
  }: {
    targetType: "group" | "person";
    targetId: string;
    source: "group_match" | "people_match" | "realm_content";
    contentId: string | null;
  }) {
    if (!profile || negotiationLoading) return;

    setActiveView("negotiation");
    setNegotiationLoading(true);
    setNegotiatingTargetId(targetId);
    setNegotiationError(null);

    try {
      const response = await fetch("/api/agent/negotiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile,
          soulProfile: personality.finalProfile,
          targetType,
          targetId,
          source,
          contentId,
        }),
      });

      const data = (await response.json()) as
        | NegotiationResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error : "Agent 协商失败");
      }

      if (!("result" in data)) {
        throw new Error("Agent 协商失败");
      }

      setNegotiationResponse(data);
    } catch (negotiationSubmitError) {
      const message =
        negotiationSubmitError instanceof Error
          ? negotiationSubmitError.message
          : "Agent 协商失败";
      setNegotiationError(message);
    } finally {
      setNegotiationLoading(false);
      setNegotiatingTargetId(null);
    }
  }

  function handleNavigate(view: DemoView) {
    setActiveView(view);
  }

  async function handleStartPersonality(seed: string) {
    const started = await personality.startWithSeed(seed);
    if (started) {
      setActiveView("persona_test");
    }
  }

  async function handleUseDemoPersonalitySeed() {
    const started = await personality.useDemoSeed();
    if (started) {
      setActiveView("persona_test");
    }
  }

  async function handlePersonalityAnswer(answer: string) {
    const response = await personality.sendAnswer(answer);
    if (response?.is_final_ready) {
      setActiveView("persona_result");
    }
  }

  function handleRestartPersonality() {
    personality.resetPersonalityTest();
    setActiveView("persona_seed");
  }

  const [handledRestoredProfile, setHandledRestoredProfile] = useState(false);

  useEffect(() => {
    if (!handledRestoredProfile && personality.isRestored) {
      setActiveView("persona_result");
      setHandledRestoredProfile(true);
    }
  }, [handledRestoredProfile, personality.isRestored]);

  function renderView() {
    if (activeView === "home") {
      return (
        <HomeView
          isLoading={isLoading}
          onStart={(message) => void submitUserMessage(message)}
          onNavigateProfile={() => setActiveView("profile")}
          onNavigateGroup={() => setActiveView("group_match")}
          onNavigateRealm={() => setActiveView("realm_feed")}
          onStartPersona={() => setActiveView("persona_seed")}
        />
      );
    }

    if (activeView === "persona_seed") {
      return (
        <PersonaSeedView
          initialSeed={personality.initialSeed}
          isLoading={personality.isLoading}
          error={personality.error}
          onSeedChange={personality.setInitialSeed}
          onStart={(seed) => void handleStartPersonality(seed)}
          onUseDemoSeed={() => void handleUseDemoPersonalitySeed()}
        />
      );
    }

    if (activeView === "persona_test") {
      return (
        <PersonaTestView
          messages={personality.messages}
          currentQuestion={personality.currentQuestion}
          phase={personality.state.phase}
          answeredCount={personality.answeredCount}
          totalQuestions={personality.totalQuestions}
          needsVerification={personality.needsVerification}
          isLoading={personality.isLoading}
          error={personality.error}
          onAnswer={(answer) => void handlePersonalityAnswer(answer)}
          onReset={handleRestartPersonality}
        />
      );
    }

    if (activeView === "persona_result") {
      return (
        <PersonaResultView
          finalProfile={personality.finalProfile}
          parseError={personality.parseError}
          needsVerification={personality.needsVerification}
          onEnterInterview={() => setActiveView("interview")}
          onRestart={handleRestartPersonality}
        />
      );
    }

    if (activeView === "interview") {
      return (
        <InterviewView
          messages={messages}
          input={input}
          isLoading={isLoading}
          error={error}
          ready={isInterviewReady}
          profileLoading={profileLoading}
          profileError={profileError}
          onInputChange={setInput}
          onSend={() => void submitUserMessage()}
          onClear={handleClear}
          onGenerateProfile={() => void handleGenerateProfile()}
          onContinueInterview={handleContinueInterview}
        />
      );
    }

    if (activeView === "profile") {
      return (
        <ProfileView
          profile={profile}
          groupLoading={groupMatchLoading}
          peopleLoading={peopleMatchLoading}
          realmLoading={realmLoading}
          groupError={groupMatchError}
          peopleError={peopleMatchError}
          realmError={realmError}
          onInterview={() => setActiveView("interview")}
          onMatchGroups={() => void handleMatchGroups()}
          onMatchPeople={() => void handleMatchPeople()}
          onRecommendRealm={() => void handleRecommendRealm()}
        />
      );
    }

    if (activeView === "group_match") {
      return (
        <GroupMatchView
          response={groupMatchResponse}
          loading={groupMatchLoading}
          negotiatingTargetId={negotiatingTargetId}
          usesLongTermProfile={Boolean(personality.finalProfile)}
          onMatch={() => void handleMatchGroups()}
          onNegotiateGroup={(groupId) => void handleNegotiateGroup(groupId)}
        />
      );
    }

    if (activeView === "people_match") {
      return (
        <PeopleMatchView
          response={peopleMatchResponse}
          loading={peopleMatchLoading}
          negotiatingTargetId={negotiatingTargetId}
          usesLongTermProfile={Boolean(personality.finalProfile)}
          onMatch={() => void handleMatchPeople()}
          onNegotiatePerson={(personId) => void handleNegotiatePerson(personId)}
        />
      );
    }

    if (activeView === "realm_feed") {
      return (
        <RealmFeedView
          response={realmResponse}
          loading={realmLoading}
          negotiatingTargetId={negotiatingTargetId}
          usesLongTermProfile={Boolean(personality.finalProfile)}
          onRecommend={() => void handleRecommendRealm()}
          onNegotiatePerson={(personId, contentId) =>
            void handleNegotiatePersonFromContent(personId, contentId)
          }
          onNegotiateGroup={(groupId, contentId) =>
            void handleNegotiateGroupFromContent(groupId, contentId)
          }
        />
      );
    }

    return (
      <>
        {negotiationError ? (
          <div className="mb-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {negotiationError}
          </div>
        ) : null}
        <NegotiationView
          response={negotiationResponse}
          loading={negotiationLoading}
          usesLongTermProfile={Boolean(personality.finalProfile)}
        />
      </>
    );
  }

  return (
    <AppShell
      activeView={activeView}
      onNavigate={handleNavigate}
      rightPanel={
        <RightPanel
          activeView={activeView}
          profile={profile}
          hasSoulProfile={Boolean(personality.finalProfile)}
          userRoundCount={userRoundCount}
        />
      }
    >
      {renderView()}
    </AppShell>
  );
}
