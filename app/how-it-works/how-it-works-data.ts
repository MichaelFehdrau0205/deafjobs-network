// One FAQ list per audience. Kept as data so the copy is easy to edit
// without touching the tabs component.
export type Audience = "candidates" | "employers";

export type Faq = { q: string; a: string[] };

export const AUDIENCE_LABEL: Record<Audience, string> = {
  candidates: "For Deaf & hard of hearing candidates",
  employers: "For employers & hiring managers",
};

export const TAB_LABEL: Record<Audience, string> = {
  candidates: "I'm looking for work",
  employers: "I'm hiring",
};

export const FAQS: Record<Audience, Faq[]> = {
  candidates: [
    {
      q: "Who can see the jobs?",
      a: [
        "Postings on DEAFJOBS are open to Deaf and hard of hearing candidates first. Hearing applicants don't see them, so you're not competing with the whole internet for the same role.",
      ],
    },
    {
      q: "What do I need to apply?",
      a: [
        "A profile. It has three parts: your basics, your resume, and a short video introduction with captions. Upload a resume and we pull it into your profile so you don't retype it.",
        "The video is the part hiring managers respond to most. They see you, and they can read along with your captions. You review and correct the captions yourself before anyone sees them.",
      ],
    },
    {
      q: "What will I know about an employer before I apply?",
      a: [
        "Every employer answered four real questions before they could post: whether they've hired Deaf talent before, which accommodations they will provide, which interview formats they offer, and which named person at the company agreed to it.",
        "You see those answers on the posting, so you can judge whether they mean it before you spend time on an application.",
      ],
    },
    {
      q: "What happens after I apply?",
      a: [
        "Your dashboard shows every application and where it stands: Applied, Viewed, Messaged, Interview requested, or Not a match. You can open any application to read the messages the employer sent.",
        "Messages are always text, so nothing depends on a phone call.",
        "Want to know right away? You can choose how you'd like to be alerted: a text message to your phone, an email, or an alert in the app. It's just an option. Pick what works for you on your applications page.",
      ],
    },
    {
      q: "How does the interview work?",
      a: [
        "The employer lists the formats they offer, and you use the one that works best for you: live captions, a written or text-based interview, video with captions, or an ASL interpreter they provide.",
        "Phone calls can go through Video Relay Service, which is free and connects you with an interpreter over video.",
      ],
    },
    {
      q: "What if I hear no, or don't hear back?",
      a: [
        "A no means the job wasn't the right match. That is about fit, not about you. Your dashboard shows \"Not a match\" with a short note from the employer, and your profile stays ready for the next job.",
        "If you don't hear back, don't be discouraged. Employers can take a while, and new jobs come up all the time. Keep going. The right match is out there.",
      ],
    },
    {
      q: "Does it cost anything?",
      a: ["No. DEAFJOBS is free for candidates. Employers are the ones who pay to post."],
    },
  ],
  employers: [
    {
      q: "Why do employers use DEAFJOBS?",
      a: [
        "Most hesitation about hiring a Deaf person isn't prejudice. It's not knowing how it would work. DEAFJOBS answers that up front: captioning comes with your posting, the accommodations are priced plainly, and you're never figuring it out alone.",
      ],
    },
    {
      q: "What do I have to do before I can post a role?",
      a: [
        "Answer four questions: whether you've hired Deaf talent before, which accommodations you're prepared to provide, which interview formats you can offer, and who at your company has agreed to this. There are no wrong answers to the first one. The last one is a specific name and role, which is what turns a policy into accountability.",
        "Your answers show on every posting you make, so candidates see them before they apply.",
      ],
    },
    {
      q: "What does it cost?",
      a: [
        "A one-time posting fee, the same familiar kind you'd pay on other job boards. Live captioning is included with your posting and stays on for as long as the posting is open, up to 60 days.",
        "Most other accommodations cost tens of dollars a month, not thousands. The full list, with real prices, is on the Resources page.",
      ],
    },
    {
      q: "What does captioning cover?",
      a: [
        "Live captions for your interviews and conversations with candidates while your posting is open. When the role is filled and the posting closes, captioning ends. Post again and it comes back with the new posting.",
      ],
    },
    {
      q: "How do I talk to candidates?",
      a: [
        "From your Applicants page. Open an application and send a message from a ready-made template: a thank-you, a few questions, or a request for the interview time that works best for them. You can edit any template before you send it.",
        "You'll also see each candidate's status, so you always know who you've replied to.",
      ],
    },
    {
      q: "I've never interviewed a Deaf candidate. What do I do?",
      a: [
        "You have options, and you pick the one you're comfortable with. Type questions and answers back and forth. Turn on live captions. Book an ASL interpreter, about $65 an hour with a one-hour minimum, which is usually all an interview needs. Or hop on a Video Relay Service call, which is free.",
        "The interview is the same conversation you'd have with any candidate. It just runs through text or an interpreter.",
      ],
    },
    {
      q: "What happens after my posting closes?",
      a: [
        "Captioning stops. If you want to keep it for day-to-day meetings, real-time captioning runs about $20 a month per seat. That's optional, and by then you've already run captioned interviews and seen how it works.",
      ],
    },
    {
      q: "Are there legal or tax considerations?",
      a: [
        "Providing reasonable accommodations is already part of federal law under the ADA, and some small businesses may qualify for a federal tax credit for accessibility costs (IRS Form 8826). Rules and eligibility change, so check the current guidance or ask your accountant.",
      ],
    },
  ],
};
