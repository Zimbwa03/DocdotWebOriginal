# Prompt for Cursor Agent: Docdot Lecture Feature Development

## Project Overview

This document provides a comprehensive prompt for the Cursor agent to develop a new, intelligent lecture recording and note-taking feature for the existing Docdot medical education platform. The goal is to create a robust system that assists medical students at the University of Zimbabwe in capturing, transcribing, summarizing, and organizing lecture content, especially when lectures involve a mix of Shona and English.

## Feature Requirements

The new feature, tentatively named "Docdot Lecture Assistant," must fulfill the following core requirements:

1.  **Real-time Lecture Recording and Live Transcription**: The application must be able to record live audio from lectures and simultaneously generate a real-time transcript. This transcript should be displayed live to the user.
2.  **Mixed Language Handling (Shona & English)**: The system must accurately process lectures delivered in a blend of Shona and English. Specifically, any Shona spoken during the lecture should be understood, transcribed, and then translated into English within the live transcript and for subsequent note generation.
3.  **Intelligent Live Note Generation**: While the lecture is ongoing, the system should intelligently extract key information from the live, unified English transcript and begin forming preliminary notes. These notes should focus on academic content and evolve as the lecture progresses.
4.  **Post-Lecture Summarization and Research**: Upon completion of the lecture, the system must process the full transcript and preliminary notes to generate a comprehensive, accurate, and highly detailed summary. This summary should be enriched with relevant research, drawing upon external knowledge to provide a deeper understanding of the topics discussed.
5.  **Irrelevant Content Filtering**: The summarization process must be sophisticated enough to identify and exclude non-academic content, such as jokes, personal anecdotes, or off-topic discussions, ensuring the final notes are purely academic and relevant for exam preparation.
6.  **Organized Storage with Metadata**: All generated notes (transcripts, preliminary notes, and final summaries) must be stored persistently within the Docdot application. Each set of notes should be associated with metadata including the lecture date, module name, and topic, to facilitate easy retrieval and organization.
7.  **Gemini AI Integration**: Gemini AI is the primary large language model to be utilized for all intelligent processing tasks, including but not limited to: advanced transcription (if applicable), language detection, translation, real-time note extraction, post-lecture summarization, external knowledge integration, and structured output generation.
8.  **Structured and Exam-Oriented Output**: The final summarized notes should be presented in a clear, concise, and structured format. This includes the intelligent use of tables, bullet points, and other formatting elements where necessary to enhance readability and aid in exam revision.

## Technical Architecture (Based on Docdot's Existing Stack)

The feature will be integrated into the existing Docdot application, leveraging its current technology stack:

*   **Frontend**: React 18 with TypeScript, Wouter, Shadcn/ui, Tailwind CSS, TanStack Query, React Context.
*   **Backend**: Node.js with Express.js, TypeScript, Drizzle ORM, Supabase Auth integration.
*   **Database**: Supabase (PostgreSQL).

### Proposed Component Breakdown and Responsibilities:

#### 1. Frontend (React/TypeScript)

*   **Lecture Recording UI**: Develop a user-friendly interface for starting, pausing, and stopping lecture recordings. This UI will include a visual indicator of recording status.
*   **Live Transcript Display**: Implement a real-time scrolling display area for the live transcript. This display should update smoothly as new text is transcribed and translated.
*   **Note Viewing & Management**: Create dedicated screens for viewing, searching, and managing past lecture notes. This includes filtering by date, module, and topic. The display of summarized notes should be clean and easy to navigate, supporting tables and other rich text formatting.
*   **Audio Playback (Optional but Recommended)**: Integrate functionality to play back the recorded audio, ideally synchronized with the transcript.
*   **Integration with Existing Docdot Features**: Ensure seamless navigation and data flow with other Docdot features (e.g., study planner, analytics).

#### 2. Backend (Node.js/Express.js)

*   **Audio Streaming Endpoint**: Create a robust WebSocket or HTTP streaming endpoint to receive live audio data from the frontend. This endpoint will buffer and forward audio to the STT service.
*   **Orchestration Layer**: Develop a service layer responsible for orchestrating calls to external AI services (STT, Translation, Gemini AI). This includes handling API keys, rate limiting, and error handling.
*   **Real-time Transcript Relay**: Implement a mechanism to receive real-time transcripts from the STT/Translation service and relay them efficiently to the frontend for live display.
*   **Post-Lecture Processing Trigger**: Implement a trigger (e.g., an API call from the frontend upon lecture end) to initiate the asynchronous post-lecture summarization and research process.
*   **Database Interaction**: Develop API endpoints and Drizzle ORM models for storing and retrieving:
    *   Raw audio files (or links to cloud storage).
    *   Raw and unified English transcripts.
    *   Preliminary live notes.
    *   Final summarized and researched notes.
    *   Lecture metadata (date, module, topic, lecturer).

#### 3. AI Services Integration

*   **Speech-to-Text (STT) Service**: Select and integrate a third-party STT API capable of real-time transcription and, crucially, strong performance with mixed Shona and English. Candidates include Gladia, ElevenLabs, Google Cloud Speech-to-Text, or Azure AI Speech. The chosen service must provide accurate transcription of both languages.
*   **Language Detection & Translation Service**: If the chosen STT service does not natively handle mixed-language translation to English, integrate a separate service (e.g., TransWord.AI, Vscoped) to detect Shona segments and translate them into English. This ensures a unified English transcript for subsequent processing.
*   **Gemini AI (Core Intelligence)**:
    *   **Real-time Note Extraction**: Develop a module that continuously feeds the live, unified English transcript to Gemini AI. Gemini AI will be prompted to identify and extract key academic points, concepts, and definitions, forming preliminary notes. These notes should be concise and capture the essence of the lecture as it unfolds.
    *   **Post-Lecture Summarization & Research**: This is the most critical application of Gemini AI. The agent will need to:
        *   **Receive Inputs**: Take the complete, unified English transcript and the preliminary notes as input.
        *   **Summarization**: Generate a highly accurate, detailed, and comprehensive summary of the lecture. The prompt to Gemini AI must explicitly instruct it to:
            *   Focus *only* on academic and medically relevant content.
            *   Strictly filter out irrelevant conversational elements (jokes, personal anecdotes, digressions).
            *   Maintain the core essence and key takeaways of the lecture.
            *   Ensure factual accuracy based on the lecture content.
        *   **External Knowledge Integration**: Instruct Gemini AI to leverage its vast knowledge base to research and augment the summarized notes. This means adding relevant medical context, definitions, explanations, and related concepts that were discussed or implied in the lecture, even if not explicitly detailed. This should elevate the notes beyond mere summarization to a well-researched study aid.
        *   **Structured Output**: Require Gemini AI to format the final summary in a highly readable and exam-friendly manner. This includes:
            *   Using clear headings and subheadings.
            *   Incorporating tables for comparisons, classifications, or lists of symptoms/treatments where appropriate.
            *   Using bullet points or numbered lists for key facts and steps.
            *   Maintaining a professional and academic tone.

#### 4. Database (Supabase - PostgreSQL)

*   **Schema Design**: Design and implement database schemas (using Drizzle ORM) for:
    *   `lectures`: Stores lecture metadata (id, date, module, topic, lecturer, audio_file_url).
    *   `transcripts`: Stores raw and unified English transcripts, linked to `lectures`.
    *   `notes`: Stores preliminary live notes and final summarized/researched notes, linked to `lectures`.
*   **Data Storage & Retrieval**: Implement Drizzle ORM queries for efficient storage and retrieval of all lecture-related data.
*   **Indexing**: Ensure appropriate indexing on `date`, `module`, and `topic` fields for fast searching and filtering.

## Development Workflow for Cursor Agent

1.  **Initial Setup**: Verify access to the Docdot codebase and necessary API keys (Supabase, DeepSeek, and any new STT/Translation services).
2.  **Frontend UI Development**: Implement the lecture recording interface and live transcript display in React/TypeScript. Focus on real-time updates and user experience.
3.  **Backend Audio Streaming**: Develop the Node.js/Express.js backend endpoint for receiving and processing live audio streams.
4.  **STT & Translation Integration**: Integrate the chosen STT and translation APIs. Test thoroughly with mixed Shona-English audio samples to ensure accuracy.
5.  **Gemini AI Integration (Real-time Notes)**: Implement the real-time note extraction using Gemini AI. This will involve designing effective prompts for Gemini to process streaming text and extract key information.
6.  **Database Integration**: Update Supabase schema and implement Drizzle ORM models for storing all lecture data.
7.  **Gemini AI Integration (Post-Lecture Summarization & Research)**: Develop the post-lecture processing module. This is a critical step requiring careful prompt engineering for Gemini AI to achieve the desired level of summarization, research, and irrelevant content filtering. Iterative testing with diverse lecture content will be essential.
8.  **Frontend Integration (Post-Lecture)**: Integrate the display of final summarized notes into the Docdot UI, ensuring proper formatting and search capabilities.
9.  **Testing**: Conduct comprehensive testing, including:
    *   Unit tests for individual components.
    *   Integration tests for the entire pipeline (audio capture to final notes).
    *   Performance testing for real-time transcription and summarization.
    *   User acceptance testing with medical students to gather feedback on accuracy, relevance, and usability.
10. **Error Handling & Logging**: Implement robust error handling and logging throughout the system to facilitate debugging and maintenance.

## Key Considerations for Cursor Agent

*   **Prompt Engineering for Gemini AI**: The success of this feature heavily relies on finely tuned prompts for Gemini AI. Pay close attention to:
    *   **Contextual Understanding**: How to provide Gemini with sufficient context about medical lectures to ensure accurate and relevant note generation and summarization.
    *   **Filtering Logic**: Explicitly instruct Gemini on what constitutes 


irrelevant content (jokes, personal anecdotes, etc.) and how to exclude it.
    *   **Research Integration**: Guide Gemini on how to effectively integrate external knowledge into the summary without hallucinating or introducing inaccuracies.
    *   **Structured Output**: Define clear instructions for generating tables, bullet points, and other formatting elements.
*   **Performance Optimization**: Given the real-time nature of transcription and the potential for large lecture files, optimize for performance at every stage.
*   **Scalability**: Design components with scalability in mind, anticipating a growing user base and increasing lecture volume.
*   **User Feedback Loop**: Consider how user feedback on transcription accuracy or summary quality can be used to further refine the system.

## Example Workflow (User Perspective)

1.  A medical student opens the Docdot app before a lecture.
2.  They navigate to the "Lecture Assistant" feature and click "Start Recording."
3.  As the lecturer speaks, a live transcript appears on their screen, updating in real-time. If the lecturer speaks Shona, it is automatically translated to English in the transcript.
4.  After the lecture, the student clicks "End Recording."
5.  The app processes the recording. Within a short period, a notification appears: "Your lecture notes for [Module Name] - [Topic] are ready."
6.  The student opens the notes, which are a concise, well-researched summary of the lecture, with key concepts highlighted and relevant tables included. Irrelevant chatter is absent.
7.  The notes are automatically saved under the correct date, module, and topic, accessible anytime for revision.

## Conclusion

This feature will significantly enhance the value of Docdot for medical students, providing an indispensable tool for efficient and effective lecture comprehension and revision. The Cursor agent is tasked with bringing this vision to life, focusing on accuracy, performance, and intelligent application of AI, particularly Gemini AI, to deliver a truly transformative learning experience.


