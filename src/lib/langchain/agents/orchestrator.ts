import type { 
  ClassificationResult, 
  RetrievalResult, 
  DashboardOutput
} from "@/types";
import { classifierAgent } from "./classifier";
import { retrieverAgent } from "./retriever";
import { summarizerAgent } from "./summarizer";
// Basic validation function (integrated for now)
async function validateDashboard(
  dashboardOutput: DashboardOutput,
  classification: ClassificationResult
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // Basic validation checks
  if (!dashboardOutput.title || dashboardOutput.title.trim().length === 0) {
    errors.push("Dashboard title is required");
  }
  
  if (dashboardOutput.type !== classification.type) {
    warnings.push(`Output type "${dashboardOutput.type}" doesn't match classified type "${classification.type}"`);
  }
  
  if (dashboardOutput.data.length === 0 && dashboardOutput.type !== 'text') {
    warnings.push("Dashboard has no data points");
  }
  
  // Sublinks validation
  if (dashboardOutput.sublinks) {
    dashboardOutput.sublinks.forEach((sublink, index) => {
      if (!sublink.label || sublink.label.trim().length === 0) {
        errors.push(`Sublink ${index + 1}: Label is required`);
      }
      if (!sublink.route || sublink.route.trim().length === 0) {
        errors.push(`Sublink ${index + 1}: Route is required`);
      }
    });
  }
  
  const isValid = errors.length === 0;
  
  // Auto-correction for common issues
  let correctedOutput: DashboardOutput | undefined;
  if (!isValid && !dashboardOutput.title) {
    correctedOutput = {
      ...dashboardOutput,
      title: `${dashboardOutput.type.replace('_', ' ')} Analysis`
    };
  }
  
  return {
    isValid,
    errors,
    warnings,
    suggestions,
    correctedOutput
  };
}

// Define validation result interface locally
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  correctedOutput?: DashboardOutput;
}

// Agent States and Flow Control
export enum AgentPhase {
  CLASSIFICATION = "classification",
  RETRIEVAL = "retrieval", 
  SUMMARIZATION = "summarization",
  VALIDATION = "validation",
  COMPLETED = "completed",
  ERROR = "error"
}

export interface AgentExecutionState {
  phase: AgentPhase;
  query: string;
  userId: string;
  classification?: ClassificationResult;
  retrievalResult?: RetrievalResult;
  dashboardOutput?: DashboardOutput;
  validationResult?: ValidationResult;
  error?: string;
  metadata: {
    startTime: Date;
    phaseTimings: Record<string, number>;
    totalTokensUsed: number;
    agentDecisions: Record<string, unknown>;
  };
}



/**
 * Multi-Agent Orchestrator
 * Coordinates the execution of specialized agents in a structured pipeline
 */
export class MultiAgentOrchestrator {
  private state: AgentExecutionState;
  
  constructor(query: string, userId: string) {
    this.state = {
      phase: AgentPhase.CLASSIFICATION,
      query,
      userId,
      metadata: {
        startTime: new Date(),
        phaseTimings: {},
        totalTokensUsed: 0,
        agentDecisions: {}
      }
    };
  }

  /**
   * Execute the complete multi-agent pipeline
   */
  async execute(): Promise<DashboardOutput> {
    try {
      console.log("[Orchestrator] Starting multi-agent execution for query:", this.state.query);
      
      // Phase 1: Classification
      await this.runClassificationPhase();
      
      // Phase 2: Retrieval (conditional)
      await this.runRetrievalPhase();
      
      // Phase 3: Summarization
      await this.runSummarizationPhase();
      
      // Phase 4: Validation
      await this.runValidationPhase();
      
      this.state.phase = AgentPhase.COMPLETED;
      console.log("[Orchestrator] Pipeline completed successfully");
      console.log("[Orchestrator] Execution metadata:", this.state.metadata);
      
      return this.state.dashboardOutput!;
      
    } catch (error) {
      this.state.phase = AgentPhase.ERROR;
      this.state.error = error instanceof Error ? error.message : String(error);
      console.error("[Orchestrator] Pipeline failed:", error);
      throw error;
    }
  }

  /**
   * Phase 1: Classification Agent
   * Determines visualization type and requirements
   */
  private async runClassificationPhase(): Promise<void> {
    const phaseStart = Date.now();
    console.log("[Orchestrator] Phase 1: Classification");
    
    try {
      this.state.classification = await classifierAgent(this.state.query);
      
      this.state.metadata.agentDecisions.classification = {
        type: this.state.classification.type,
        complexity: this.state.classification.complexity,
        requiresRAG: this.state.classification.requiresRAG,
        requiresExternal: this.state.classification.requiresExternal,
        requiresImage: this.state.classification.requiresImage
      };
      
      console.log("[Orchestrator] Classification result:", this.state.classification);
      this.state.phase = AgentPhase.RETRIEVAL;
      
    } catch (error) {
      console.error("[Orchestrator] Classification phase failed:", error);
      throw new Error(`Classification failed: ${error}`);
    } finally {
      this.state.metadata.phaseTimings.classification = Date.now() - phaseStart;
    }
  }

  /**
   * Phase 2: Retrieval Agent  
   * Chooses between Pinecone vs external sources
   */
  private async runRetrievalPhase(): Promise<void> {
    const phaseStart = Date.now();
    console.log("[Orchestrator] Phase 2: Retrieval");
    
    try {
      const shouldRetrieve = this.state.classification!.requiresRAG || 
                           this.state.classification!.requiresExternal;
      
      if (shouldRetrieve) {
        this.state.retrievalResult = await retrieverAgent(
          this.state.query,
          this.state.userId,
          this.state.classification!
        );
        
        this.state.metadata.agentDecisions.retrieval = {
          chunksRetrieved: this.state.retrievalResult.chunks.length,
          citationsFound: this.state.retrievalResult.citations.length,
          retrievalSource: this.state.classification!.requiresRAG ? 'pinecone' : 'external'
        };
        
        console.log("[Orchestrator] Retrieved", this.state.retrievalResult.chunks.length, "chunks");
      } else {
        this.state.retrievalResult = { chunks: [], citations: [] };
        this.state.metadata.agentDecisions.retrieval = { skipped: true, reason: "No retrieval required" };
        console.log("[Orchestrator] Retrieval skipped - not required");
      }
      
      this.state.phase = AgentPhase.SUMMARIZATION;
      
    } catch (error) {
      console.error("[Orchestrator] Retrieval phase failed:", error);
      throw new Error(`Retrieval failed: ${error}`);
    } finally {
      this.state.metadata.phaseTimings.retrieval = Date.now() - phaseStart;
    }
  }

  /**
   * Phase 3: Summarization Agent
   * Outputs structured JSON schema + sublinks
   */
  private async runSummarizationPhase(): Promise<void> {
    const phaseStart = Date.now();
    console.log("[Orchestrator] Phase 3: Summarization");
    
    try {
      this.state.dashboardOutput = await summarizerAgent({
        query: this.state.query,
        context: this.state.retrievalResult!,
        classification: this.state.classification!
      });
      
      this.state.metadata.agentDecisions.summarization = {
        outputType: this.state.dashboardOutput.type,
        sectionsGenerated: this.state.dashboardOutput.data?.length || 0,
        hasSublinks: !!(this.state.dashboardOutput.sublinks?.length),
        hasCharts: !!(this.state.dashboardOutput.charts?.length)
      };
      
      console.log("[Orchestrator] Generated dashboard:", this.state.dashboardOutput.type);
      this.state.phase = AgentPhase.VALIDATION;
      
    } catch (error) {
      console.error("[Orchestrator] Summarization phase failed:", error);
      throw new Error(`Summarization failed: ${error}`);
    } finally {
      this.state.metadata.phaseTimings.summarization = Date.now() - phaseStart;
    }
  }

  /**
   * Phase 4: UI Schema Validation
   * Ensures front-end consistency and catches issues
   */
  private async runValidationPhase(): Promise<void> {
    const phaseStart = Date.now();
    console.log("[Orchestrator] Phase 4: Validation");
    
    try {
      this.state.validationResult = await validateDashboard(
        this.state.dashboardOutput!,
        this.state.classification!
      );
      
      if (this.state.validationResult && !this.state.validationResult.isValid) {
        console.warn("[Orchestrator] Validation issues found:", this.state.validationResult.errors);
        
        // Use corrected output if available
        if (this.state.validationResult.correctedOutput) {
          console.log("[Orchestrator] Using corrected output from validator");
          this.state.dashboardOutput = this.state.validationResult.correctedOutput;
        }
      }
      
      this.state.metadata.agentDecisions.validation = {
        isValid: this.state.validationResult?.isValid ?? false,
        errorsFound: this.state.validationResult?.errors.length ?? 0,
        warningsFound: this.state.validationResult?.warnings.length ?? 0,
        wasAutoCorrected: !!(this.state.validationResult?.correctedOutput)
      };
      
      console.log("[Orchestrator] Validation completed");
      
    } catch (error) {
      console.error("[Orchestrator] Validation phase failed:", error);
      // Validation failure is non-critical - continue with original output
      console.warn("[Orchestrator] Continuing with unvalidated output");
      
      this.state.validationResult = {
        isValid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
        suggestions: []
      };
    } finally {
      this.state.metadata.phaseTimings.validation = Date.now() - phaseStart;
    }
  }

  /**
   * Get current execution state (useful for debugging/monitoring)
   */
  getState(): AgentExecutionState {
    return { ...this.state };
  }

  /**
   * Get execution summary for logging/analytics
   */
  getExecutionSummary() {
    const totalTime = Date.now() - this.state.metadata.startTime.getTime();
    
    return {
      query: this.state.query,
      userId: this.state.userId,
      finalPhase: this.state.phase,
      totalExecutionTime: totalTime,
      phaseBreakdown: this.state.metadata.phaseTimings,
      success: this.state.phase === AgentPhase.COMPLETED,
      error: this.state.error,
      outputType: this.state.dashboardOutput?.type,
      agentDecisions: this.state.metadata.agentDecisions
    };
  }
}

/**
 * Main entry point for multi-agent pipeline execution
 */
export async function executeMultiAgentPipeline(
  query: string, 
  userId: string
): Promise<DashboardOutput> {
  const orchestrator = new MultiAgentOrchestrator(query, userId);
  return await orchestrator.execute();
}

/**
 * Execute pipeline with detailed monitoring
 */
export async function executeMultiAgentPipelineWithMonitoring(
  query: string,
  userId: string
): Promise<{ output: DashboardOutput; summary: Record<string, unknown> }> {
  const orchestrator = new MultiAgentOrchestrator(query, userId);
  
  try {
    const output = await orchestrator.execute();
    const summary = orchestrator.getExecutionSummary();
    
    return { output, summary };
  } catch (error) {
    const summary = orchestrator.getExecutionSummary();
    throw new Error(`Pipeline failed: ${error}. Summary: ${JSON.stringify(summary)}`);
  }
}