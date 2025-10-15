// Oracle Card Data - Rooted & Growing Oracle

export interface OracleCard {
  id: string;
  title: string;
  description: string;
  prompts: string[];
  action: string;
  tags: string[];
  image: string;
  isPremium?: boolean;
  teaser?: string; // 40-60 word preview for locked cards
}

// Card data - First 12 FREE (with images), remaining 32 PREMIUM (Rooted & Growing +)
export const ORACLE_CARDS: OracleCard[] = [
  {
    id: "abundance",
    title: "Abundance",
    description: "*The Abundance card asks us to adopt a generous mindset\u2014choosing thoughts and actions that invite prosperity, beauty, and flow.*\nFocus on what is thriving and tend it with gratitude. Act from sufficiency, not scarcity, and let your daily choices reflect the future you are calling in. Abundance grows where attention, care, and appreciation meet.",
    prompts: [
      "Where is abundance already present that I have not acknowledged?",
      "What daily action would signal to myself that I trust in more-than-enough?",
    ],
    action: "I am cultivating abundance and prosperity in my life.",
    tags: ["abundance", "growth", "presence", "spring", "earth"],
    image: "abundance.png",
    isPremium: true,
    teaser: "Discover how to cultivate a generous mindset that invites prosperity and flow. Learn to recognize abundance already present in your life and take actions that reflect your trust in more-than-enough."
  },
  {
    id: "balance",
    title: "Balance",
    description: "*The Balance card asks us to harmonize effort and ease\u2014guarding time for rest, play, and purposeful work.*\nLike sun and shade in a healthy garden, your life needs both movement and stillness. Adjust your rhythm so you feel nourished, not depleted. Small, steady course corrections keep you well.",
    prompts: [
      "What feels overexposed to sun (effort) and what needs more shade (rest)?",
      "Which boundary would restore balance this week?",
    ],
    action: "I am finding balance between work and play, and between my inner and outer gardens.",
    tags: ["harmony", "presence", "rest", "all-seasons", "air"],
    image: "balance.png",
    isPremium: true,
    teaser: "Find harmony through the art of responsive adjustment rather than perfect stillness. Learn to recognize when life feels out of alignment and make small shifts toward equilibrium."
  },
  {
    id: "bloom",
    title: "Bloom",
    description: "*The Bloom card asks us to embrace our individuality and open in our own season\u2014showing our full colors without apology.*\nGive yourself permission to be seen as you are becoming. Celebrate your strengths, honor your tender edges, and let joy be visible. Your authenticity is the fragrance that draws what is meant for you.",
    prompts: [
      "Where am I hiding my colors, and why?",
      "What support helps me feel safe to be fully seen?",
    ],
    action: "I am embracing my individuality and allowing myself to bloom and flourish.",
    tags: ["joy", "courage", "growth", "spring", "fire"],
    image: "bloom.png",
    isPremium: false
  },
  {
    id: "blossom",
    title: "Blossom",
    description: "*The Blossom card asks us to trust our unfolding\u2014allowing potential to become expression, one brave petal at a time.*\nGrowth is delicate and determined. Meet it with patience, confidence, and gentle curiosity. You do not have to rush what is already on its way.",
    prompts: [
      "What part of me is just beginning to open?",
      "What does patience look like in this season?",
    ],
    action: "I trust my unfolding and let my true colors come forward.",
    tags: ["growth", "patience", "joy", "spring", "air"],
    image: "blossom.png",
    isPremium: true
  },
  {
    id: "compost",
    title: "Compost",
    description: "*The Compost card asks us to transform challenges into nourishment\u2014letting experience break down and feed new growth.*\nWhat felt heavy can become helpful when turned with love and time. Sift lessons from what was and return the rest to the soil. Transformation is nature's favorite alchemy.",
    prompts: [
      "Which hard experience is ready to be turned into wisdom?",
      "What can I release so it can feed my next season?",
    ],
    action: "I am turning challenges into opportunities for growth and transformation.",
    tags: ["renewal", "release", "resilience", "autumn", "earth"],
    image: "compost.png",
    isPremium: false
  },
  {
    id: "cultivate",
    title: "Cultivate",
    description: "*The Cultivate card asks us to tend our inner and outer gardens with care\u2014so growth can take root and flourish.*\nShow up for yourself the way a devoted gardener shows up for the soil: regularly, lovingly, and without drama. Your consistent attention becomes the climate in which you thrive.",
    prompts: [
      "What daily practice would most nourish my growth right now?",
      "Where do I see evidence that consistency is working?",
    ],
    action: "I am nurturing my inner and outer gardens and cultivating growth in my life.",
    tags: ["growth", "presence", "act", "all-seasons", "earth"],
    image: "cultivate.png",
    isPremium: true
  },
  {
    id: "diversity",
    title: "Diversity",
    description: "*The Diversity card asks us to welcome difference\u2014inviting a richer, more resilient ecosystem in life and work.*\nA mixed garden weathers more. Invite new perspectives, cultures, and ideas; your world becomes stronger, kinder, and more interesting. Let variety be your teacher.",
    prompts: [
      "Whose voice or viewpoint could enrich my next step?",
      "Where have I confused comfort with right, and how can I expand?",
    ],
    action: "I am embracing diversity and allowing it to enrich my life.",
    tags: ["harmony", "connection", "resilience", "all-seasons", "air"],
    image: "diversity.png",
    isPremium: true
  },
  {
    id: "emergence",
    title: "Emergence",
    description: "*The Emergence card asks us to rise with tenderness\u2014pushing through the soil toward light, one brave inch at a time.*\nThis is the threshold where hidden work becomes visible. Move gently and steadily; protect what is new while honoring how far you have come. You are allowed to grow at a pace that honors your roots.",
    prompts: [
      "What small, brave action would honor my becoming today?",
      "What protection does this new growth need from me?",
    ],
    action: "I rise with courage, trusting the tender strength of my new growth.",
    tags: ["courage", "growth", "renewal", "spring", "fire"],
    image: "emergence.png",
    isPremium: true
  },
  {
    id: "expand",
    title: "Expand",
    description: "*The Expand card asks us to stretch beyond comfort\u2014opening to new horizons, skills, and connections.*\nSay yes to a bigger field. Try, learn, iterate, repeat; curiosity is your compass. Expansion is simply practice, continued.",
    prompts: [
      "Where am I ready to go one step bigger?",
      "Which fear can I meet with curiosity instead of caution?",
    ],
    action: "I am embracing change and expanding my horizons.",
    tags: ["courage", "growth", "act", "all-seasons", "air"],
    image: "expand.png",
    isPremium: false
  },
  {
    id: "fertilize",
    title: "Fertilize",
    description: "*The Fertilize card asks us to invest in ourselves\u2014resourcing the growth we seek.*\nFeed your mind, body, and spirit with what truly sustains you. Education, mentorship, rest, and nourishment are not luxuries; they are strategy.",
    prompts: [
      "What specific resource would most accelerate my growth?",
      "Where am I underfeeding what matters?",
    ],
    action: "I am investing in my own growth and well-being.",
    tags: ["growth", "abundance", "act", "all-seasons", "earth"],
    image: "fertilize.png",
    isPremium: true
  },
  {
    id: "foundation",
    title: "Foundation",
    description: "*The Foundation card asks us to build from the ground up\u2014rooted, stable, and ready to support all we are growing.*\nStrong structures create freedom. Clarify your values, routines, and supports so your next season can flourish without wobble.",
    prompts: [
      "Which routine or value anchors me most, and how can I reinforce it?",
      "What wobbles are pointing to a foundation I can strengthen?",
    ],
    action: "I build a solid foundation for growth and positivity in my life, just as I would create a foundation for my garden.",
    tags: ["protection", "stability", "growth", "all-seasons", "earth"],
    image: "foundation.png",
    isPremium: false
  },
  {
    id: "garden-bed",
    title: "Garden Bed",
    description: "*The Garden Bed card asks us to design our base with intention\u2014structure that supports growth season after season.*\nChoose what belongs and where. Organize your time, tools, and energy so care becomes easier than avoidance. Thoughtful layout becomes effortless living.",
    prompts: [
      "What needs rearranging for ease and flow?",
      "What belongs in my bed now, and what does not?",
    ],
    action: "I create a foundation for growth and positivity in my life, just as I would a garden bed.",
    tags: ["clarity", "protection", "growth", "all-seasons", "earth"],
    image: "gardenbed.png",
    isPremium: true
  },
  {
    id: "gather",
    title: "Gather",
    description: "*The Gather card asks us to collect the resources, relationships, and wisdom we need\u2014building a strong foundation for what comes next.*\nBe open to receiving help, knowledge, and opportunities. Curate what supports you and release the rest. Your basket gets full when you show up to the field.",
    prompts: [
      "What am I ready to gather more of, and from where?",
      "Who is part of my support circle, and who else belongs?",
    ],
    action: "I am gathering the people, wisdom, and resources that help me flourish.",
    tags: ["connection", "abundance", "act", "all-seasons", "earth"],
    image: "gather.png",
    isPremium: true
  },
  {
    id: "gratitude",
    title: "Gratitude",
    description: "*The Gratitude card asks us to notice abundance now\u2014letting appreciation open the door to even more blessing.*\nName what is good, often. Gratitude expands your capacity to receive and softens the nervous system into trust.",
    prompts: [
      "List five things I am grateful for, and why each matters today.",
      "How does gratitude shift the story I am telling myself?",
    ],
    action: "I am showing gratitude for the beauty and abundance in my life.",
    tags: ["abundance", "joy", "presence", "all-seasons", "ether"],
    image: "gratitude.png",
    isPremium: true
  },
  {
    id: "green-thumb",
    title: "Green Thumb",
    description: "*The Green Thumb card asks us to nurture love for the living world\u2014refining our touch, timing, and care through devotion.*\nSkill grows from attention and affection. The more you listen, the better you tend. Let love teach your hands what to do.",
    prompts: [
      "What does listening look like in my care practices?",
      "Where can I practice a gentler touch?",
    ],
    action: "I embrace my inner gardener and cultivate a love for all things green.",
    tags: ["growth", "presence", "act", "all-seasons", "earth"],
    image: "greenthumb.png",
    isPremium: true
  },
  {
    id: "greenhouse",
    title: "Greenhouse",
    description: "*The Greenhouse card asks us to build safe containers\u2014warm, protected spaces where healing and ideas can develop.*\nOffer yourself conditions that favor growth: warmth, light, and steady care. The right environment accelerates everything.",
    prompts: [
      "What are my nonnegotiable conditions for thriving?",
      "How can I make my environment 10% kinder this week?",
    ],
    action: "I create a safe and nurturing environment for myself, just as I would in a greenhouse.",
    tags: ["protection", "restore", "rest", "winter", "earth"],
    image: "greenhouse.png",
    isPremium: true
  },
  {
    id: "growth",
    title: "Growth",
    description: "*The Growth card asks us to say yes to change\u2014stretching into new capacity with curiosity and courage.*\nLet go of the version of you that fit a smaller pot. Repot your life where needed and keep reaching for light.",
    prompts: [
      "Where have I outgrown my current container?",
      "What brave yes is calling me?",
    ],
    action: "I am embracing change and growth in my life.",
    tags: ["growth", "courage", "presence", "all-seasons", "fire"],
    image: "growth.png",
    isPremium: true
  },
  {
    id: "harvest",
    title: "Harvest",
    description: "*The Harvest card asks us to celebrate the fruits of our labor\u2014receiving, enjoying, and sharing the good we have grown.*\nPause to savor. Gather what is ripe, give thanks, and share generously. Satisfaction is part of the work.",
    prompts: [
      "What am I ready to claim as ripe right now?",
      "How do I want to enjoy and share this season's yield?",
    ],
    action: "I am reaping the benefits of my hard work and enjoying the abundance in my life.",
    tags: ["abundance", "joy", "gratitude", "autumn", "earth"],
    image: "harvest.png",
    isPremium: true
  },
  {
    id: "irrigation",
    title: "Irrigation",
    description: "*The Irrigation card asks us to create consistent channels of care\u2014regular practices that keep our inner garden hydrated.*\nSchedule your nourishment like it matters, because it does. Small, repeatable actions change the climate of a life.",
    prompts: [
      "Which daily micropractice will I commit to for the next 7 days?",
      "What tends to dry me out, and how will I counter it?",
    ],
    action: "I nourish my soul and mind with positivity and self-care, just as I water my garden.",
    tags: ["restore", "growth", "presence", "all-seasons", "water"],
    image: "irrigation.png",
    isPremium: true
  },
  {
    id: "joy",
    title: "Joy",
    description: "*The Joy card asks us to delight in the simple\u2014tiny blossoms, small wins, everyday light that lifts the heart.*\nJoy is not a reward; it is a resource. Let it refuel you for the road ahead.",
    prompts: [
      "What small joy can I savor today, deeply?",
      "How does joy change my energy and choices?",
    ],
    action: "I am finding joy in the simple things and celebrating life's blessings.",
    tags: ["joy", "abundance", "presence", "summer", "fire"],
    image: "joy.png",
    isPremium: true
  },
  {
    id: "meditate",
    title: "Meditate",
    description: "*The Meditate card asks us to enter the quiet\u2014letting stillness reset the nervous system and clarify the heart.*\nReturn to breath, sensation, and presence. From this ground, the next right action becomes obvious.",
    prompts: [
      "What helps me come back to the present in 60 seconds or less?",
      "What truth becomes clear when I get quiet?",
    ],
    action: "I find peace and tranquility in the quiet moments of gardening.",
    tags: ["rest", "clarity", "reflect", "all-seasons", "ether"],
    image: "meditate.png",
    isPremium: true
  },
  {
    id: "mindfulness",
    title: "Mindfulness",
    description: "*The Mindfulness card asks us to return to the present\u2014meeting each moment with softness and awareness.*\nSlow down enough to notice. Attention turns ordinary life into ceremony.",
    prompts: [
      "Where am I most tempted to rush, and what is beneath that?",
      "What sensations or details can I notice right now?",
    ],
    action: "I am practicing mindfulness and embracing the present moment.",
    tags: ["presence", "clarity", "reflect", "all-seasons", "air"],
    image: "mindfulness.png",
    isPremium: true
  },
  {
    id: "mulch",
    title: "Mulch",
    description: "*The Mulch card asks us to surround ourselves with support\u2014protective layers of rest, community, and positivity.*\nCover the roots of your life with what keeps moisture in and stress out. Protection is a form of love.",
    prompts: [
      "What protective layer do I need more of (rest, help, calm)?",
      "Who or what keeps my energy from leaking?",
    ],
    action: "I surround myself with positivity and support, just as I lay mulch in my garden.",
    tags: ["protection", "rest", "resilience", "winter", "earth"],
    image: "mulch.png",
    isPremium: true
  },
  {
    id: "nature",
    title: "Nature",
    description: "*The Nature card asks us to step outside, listen, and let the living world restore perspective, peace, and inspiration.*\nLet birdsong, wind, and soil retune your rhythm. Nature remembers your original pace.",
    prompts: [
      "What does the natural world want to teach me today?",
      "Where can I build a tiny daily ritual outdoors?",
    ],
    action: "I am connecting with nature and allowing its beauty to heal and inspire me.",
    tags: ["presence", "restore", "connection", "all-seasons", "earth"],
    image: "nature.png",
    isPremium: true
  },
  {
    id: "nurture",
    title: "Nurture",
    description: "*The Nurture card asks us to tend our relationship with nature and self\u2014investing time and kindness in what we want to grow.*\nOffer care without condition. What you nurture nourishes you back.",
    prompts: [
      "What does unconditional care look like for me this week?",
      "Which relationship (with self or other) needs gentler tending?",
    ],
    action: "I nurture my connection with nature and invest in my personal growth and well-being.",
    tags: ["compassion", "growth", "restore", "all-seasons", "water"],
    image: "nurture.png",
    isPremium: false
  },
  {
    id: "patience",
    title: "Patience",
    description: "*The Patience card asks us to honor timing\u2014trusting slow, steady processes and growth we cannot yet see.*\nNot every season is for harvesting. Rest in the work you have already planted and let time do its magic.",
    prompts: [
      "Where am I trying to force a timeline?",
      "What would trusting the process look like today?",
    ],
    action: "I am growing at my own pace and embracing the journey of self-discovery.",
    tags: ["rest", "resilience", "reflect", "winter", "water"],
    image: "patience.png",
    isPremium: true
  },
  {
    id: "pest-control",
    title: "Pest Control",
    description: "*The Pest Control card asks us to set loving boundaries\u2014preventing harmful influences and safeguarding wellbeing.*\nName what drains you and limit its access. Boundaries protect your bloom.",
    prompts: [
      "What pests (habits, dynamics, beliefs) nibble at my energy?",
      "What boundary would be an act of care, not punishment?",
    ],
    action: "I protect my well-being by keeping negativity at bay, just as I control pests in my garden.",
    tags: ["boundaries", "protection", "clarity", "all-seasons", "air"],
    image: "pestcontrol.png",
    isPremium: true
  },
  {
    id: "prune",
    title: "Prune",
    description: "*The Prune card asks us to release what no longer serves\u2014making space for healthier growth and clearer focus.*\nLet go with intention. Air and light need room to reach the heart of your life.",
    prompts: [
      "What am I ready to cut back or cut out entirely?",
      "How will I care for the space that pruning creates?",
    ],
    action: "I am pruning away what no longer serves me and making room for new growth.",
    tags: ["release", "clarity", "act", "autumn", "air"],
    image: "prune.png",
    isPremium: false
  },
  {
    id: "rain",
    title: "Rain",
    description: "*The Rain card asks us to welcome necessary change\u2014receiving what nourishes even when it arrives as storm.*\nAllow what comes to cleanse and renew you. Growth drinks from unexpected skies.",
    prompts: [
      "What recent weather is asking me to soften and receive?",
      "How do I want to meet change differently going forward?",
    ],
    action: "I welcome change with open arms and trust that it will bring growth and abundance to my life.",
    tags: ["renewal", "growth", "restore", "spring", "water"],
    image: "rain.png",
    isPremium: true
  },
  {
    id: "renew",
    title: "Renew",
    description: "*The Renew card asks us to shed the outworn\u2014inviting fresh energy, new beginnings, and a clearer path forward.*\nClear the bed, turn the soil, begin again. Renewal is your birthright.",
    prompts: [
      "What am I ready to refresh, restart, or retire?",
      "What small ritual could mark my new beginning?",
    ],
    action: "I am revitalizing my mind and soul and embracing new beginnings.",
    tags: ["renewal", "release", "resilience", "spring", "water"],
    image: "renew.png",
    isPremium: false
  },
  {
    id: "rooted",
    title: "Rooted",
    description: "*The Rooted card asks us to anchor in our passions\u2014letting devotion steady our path and guide our choices.*\nYour roots remember why you are here. Let purpose be the weight that keeps you grounded in strong winds.",
    prompts: [
      "Which passion anchors me, and how can I honor it this week?",
      "What practice reconnects me to my why?",
    ],
    action: "I am staying grounded in my passions and pursuits.",
    tags: ["protection", "harmony", "presence", "all-seasons", "earth"],
    image: "rooted.png",
    isPremium: true
  },
  {
    id: "roots",
    title: "Roots",
    description: "*The Roots card asks us to ground into what sustains us\u2014values, practices, and community that keep us steady.*\nNourish the unseen foundation. Deep roots make brave branches.",
    prompts: [
      "Which root (value or practice) needs feeding?",
      "Where do I feel most supported, and how can I lean in?",
    ],
    action: "I am strengthening my roots for stability and grounding in my life.",
    tags: ["stability", "protection", "growth", "all-seasons", "earth"],
    image: "roots.png",
    isPremium: false
  },
  {
    id: "sanctuary",
    title: "Sanctuary",
    description: "*The Sanctuary card asks us to create spaces of restoration\u2014gentle, protected places where our spirit can soften and refill.*\nDesign a refuge that welcomes your whole self. Keep out what depletes you and invite in what restores\u2014warm light, quiet rituals, and small comforts that make you feel whole.",
    prompts: [
      "What elements create sanctuary for me (sensory, spatial, relational)?",
      "Where can I claim or create a sanctuary corner this week?",
    ],
    action: "I honor my need for safety, softness, and a space to restore.",
    tags: ["rest", "protection", "restore", "winter", "water"],
    image: "sanctuary.png",
    isPremium: true
  },
  {
    id: "seedling",
    title: "Seedling",
    description: "*The Seedling card asks us to protect tender beginnings\u2014investing care and patience while new life establishes.*\nShield what is young from harshness. Water consistently, celebrate tiny gains, and trust the pace of becoming.",
    prompts: [
      "What new beginning needs gentle protection?",
      "How will I measure and celebrate small progress?",
    ],
    action: "I am investing in my growth and potential, just like a seedling in a garden.",
    tags: ["growth", "protection", "patience", "spring", "earth"],
    image: "seedling.png",
    isPremium: false
  },
  {
    id: "soil",
    title: "Soil",
    description: "*The Soil card asks us to enrich our foundation\u2014cultivating conditions where our goals can truly take root.*\nFeed the base and everything above grows stronger. Your daily habits are the nutrients of your becoming.",
    prompts: [
      "Which habit is the nutrient I most need right now?",
      "What depletes my soil, and how can I amend it?",
    ],
    action: "I am cultivating rich and fertile soil for my dreams and goals to take root.",
    tags: ["foundation", "growth", "abundance", "all-seasons", "earth"],
    image: "soil.png",
    isPremium: false
  },
  {
    id: "sow",
    title: "Sow",
    description: "*The Sow card asks us to plant the seeds of our dreams with intention\u2014then take steady, practical steps that help them sprout.*\nPrepare the bed, set your aim, and commit to the next small action. Seeds respond to consistent care.",
    prompts: [
      "What seed (idea or intention) am I planting next?",
      "What is the very next doable step?",
    ],
    action: "I am planting the seeds of my dreams and watching them grow.",
    tags: ["growth", "intention", "act", "spring", "earth"],
    image: "sow.png",
    isPremium: true
  },
  {
    id: "strengthen",
    title: "Strengthen",
    description: "*The Strengthen card asks us to fortify our core through consistent self-care\u2014meeting life from steadiness and power.*\nBuild capacity through routine, rest, movement, and truth-telling. Strong roots, calm nervous system, clear focus.",
    prompts: [
      "Which practice most reliably strengthens me?",
      "Where do I feel wobbly, and what would stabilize me?",
    ],
    action: "I am strengthening my mind, body, and soul for growth and well-being.",
    tags: ["resilience", "protection", "growth", "all-seasons", "fire"],
    image: "strengthen.png",
    isPremium: true
  },
  {
    id: "sunlight",
    title: "Sunlight",
    description: "*The Sunlight card asks us to turn toward warmth and possibility\u2014letting light energize our hopes and guide our next steps.*\nSeek the bright places. Let encouragement, joy, and clarity become your photosynthesis.",
    prompts: [
      "What or who is my most reliable source of light?",
      "How can I orient toward possibility today?",
    ],
    action: "I welcome light and let it energize my growth.",
    tags: ["joy", "clarity", "growth", "summer", "fire"],
    image: "sunlight.png",
    isPremium: false
  },
  {
    id: "trowel",
    title: "Trowel",
    description: "*The Trowel card asks us to work the soil\u2014doing the small, steady tasks that make transformation possible.*\nProgress is a handful at a time. Keep showing up with humble tools and a willing heart.",
    prompts: [
      "What tiny task will move the needle today?",
      "Where has small and steady already changed things?",
    ],
    action: "I cultivate my inner strength and resilience, just as I use a trowel in my garden.",
    tags: ["act", "growth", "resilience", "all-seasons", "earth"],
    image: "trowel.png",
    isPremium: true
  },
  {
    id: "trim",
    title: "Trim",
    description: "*The Trim card asks us to tidy the edges\u2014refining habits, clearing clutter, and choosing what truly matters.*\nPrecision is kindness to your future self. Make room for what you actually want.",
    prompts: [
      "What can I remove or simplify to create breathing room?",
      "Which habit is ready for a cleaner, kinder version?",
    ],
    action: "I am trimming away what no longer serves me to make room for growth and positivity.",
    tags: ["release", "clarity", "act", "autumn", "air"],
    image: "trim.png",
    isPremium: true
  },
  {
    id: "water",
    title: "Water",
    description: "*The Water card asks us to nourish ourselves regularly\u2014offering the care and attention that life and healing require.*\nHydrate your body, your dreams, and your relationships. Consistent care is what turns potential into presence.",
    prompts: [
      "Where am I most undernourished, and what will I pour in?",
      "What reminder or ritual will help me keep caring consistently?",
    ],
    action: "I am nourishing my mind, body, and soul with love and care.",
    tags: ["restore", "compassion", "growth", "all-seasons", "water"],
    image: "water.png",
    isPremium: false
  },
  {
    id: "weeds",
    title: "Weeds",
    description: "*The Weeds card asks us to name and remove what drains us\u2014restoring space for what we want to thrive.*\nPull distractions at the root. Choose environments that support your bloom.",
    prompts: [
      "What is the weed I keep stepping over?",
      "How will I prevent it from returning?",
    ],
    action: "I am removing negativity and obstacles from my life for positive growth.",
    tags: ["release", "boundaries", "clarity", "all-seasons", "air"],
    image: "weeds.png",
    isPremium: true
  },
  {
    id: "wind",
    title: "Wind",
    description: "*The Wind card asks us to stay flexible\u2014allowing movement and fresh ideas to carry us toward growth.*\nInvite cross pollination. Let curiosity move you and rigidity soften.",
    prompts: [
      "Where can I soften control and let life move me?",
      "What new idea wants to breeze in?",
    ],
    action: "I am flexible and adaptable, allowing the winds of change to guide me toward personal growth and fulfillment.",
    tags: ["flexibility", "harmony", "growth", "all-seasons", "air"],
    image: "wind.png",
    isPremium: true
  },
  {
    id: "wintering",
    title: "Wintering",
    description: "*The Wintering card asks us to honor the sacred pause\u2014slowing to conserve energy and gather strength for spring.*\nRest is strategy. Draw nourishment down to the roots and trust the unseen work of regeneration.",
    prompts: [
      "What would true rest look like for me right now?",
      "What can lie fallow so it returns stronger later?",
    ],
    action: "I allow myself to rest, root, and renew in the quiet season.",
    tags: ["rest", "renewal", "restore", "winter", "water"],
    image: "wintering.png",
    isPremium: true
  }
];

// Helper functions
export const getRandomCard = (): OracleCard => {
  const randomIndex = Math.floor(Math.random() * ORACLE_CARDS.length);
  return ORACLE_CARDS[randomIndex];
};

export const getCardById = (id: string): OracleCard | undefined => {
  return ORACLE_CARDS.find((card) => card.id === id);
};

export const getCardsBySeason = (season: string): OracleCard[] => {
  return ORACLE_CARDS.filter((card) =>
    card.tags.some((tag) => tag.includes(season))
  );
};

export const getCardsByTheme = (theme: string): OracleCard[] => {
  return ORACLE_CARDS.filter((card) =>
    card.tags.some((tag) => tag === theme)
  );
};

export const getFreeCards = (): OracleCard[] => {
  return ORACLE_CARDS.filter((card) => !card.isPremium);
};

export const getPremiumCards = (): OracleCard[] => {
  return ORACLE_CARDS.filter((card) => card.isPremium === true);
};
