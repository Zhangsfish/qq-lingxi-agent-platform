import { isPersonalityProfile } from "./personality-schema";

export function buildPersonalityMatchingContext(
  soulProfile?: unknown,
) {
  if (!isPersonalityProfile(soulProfile)) return null;

  return {
    mbti_like: soulProfile.mbti_like.type_guess,
    persona_name: soulProfile.soul_profile.persona_name,
    core_theme: soulProfile.soul_profile.core_theme,
    value_rank: soulProfile.soul_profile.value_rank,
    not_to_do_list: soulProfile.soul_profile.not_to_do_list,
    energy_mechanism: soulProfile.soul_profile.energy_mechanism,
    capability_stack: soulProfile.soul_profile.capability_stack,
    risk_blindspots: soulProfile.soul_profile.risk_blindspots,
    needs_verification: soulProfile.needs_verification,
  };
}
