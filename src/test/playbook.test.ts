import { describe, it, expect } from 'vitest'
import { PLAYBOOK_TEMPLATES, createPlaybookInstance } from '../constants/playbooks'

describe('Incident Response Playbook Engine', () => {
  it('contains all 6 mandatory cybersecurity playbooks', () => {
    const categories = PLAYBOOK_TEMPLATES.map((t) => t.category);
    expect(categories).toContain('Phishing');
    expect(categories).toContain('Malware infection');
    expect(categories).toContain('Ransomware');
    expect(categories).toContain('Credential compromise');
    expect(categories).toContain('Data breach');
    expect(categories).toContain('Suspicious network activity');
  });

  it('ensures each playbook includes the 6 canonical NIST/SANS stages', () => {
    const requiredStageIds = ['stg-prep', 'stg-id', 'stg-contain', 'stg-erad', 'stg-rec', 'stg-pir'];

    PLAYBOOK_TEMPLATES.forEach((template) => {
      expect(template.stages.length).toBe(6);
      const stageIds = template.stages.map((s) => s.id);
      requiredStageIds.forEach((id) => {
        expect(stageIds).toContain(id);
      });
    });
  });

  it('instantiates an isolated PlaybookInstance with uncompleted tasks', () => {
    const instance = createPlaybookInstance('pb-ransomware');
    expect(instance).toBeDefined();
    expect(instance?.templateId).toBe('pb-ransomware');
    expect(instance?.id).toMatch(/^pbi-/);

    // Verify all tasks start uncompleted
    let taskCount = 0;
    instance?.stages.forEach((stage) => {
      stage.tasks.forEach((task) => {
        expect(task.completed).toBe(false);
        expect(task.completedAt).toBeUndefined();
        expect(task.title.length).toBeGreaterThan(0);
        expect(task.explanation.length).toBeGreaterThan(0);
        expect(['Critical', 'High', 'Medium', 'Low']).toContain(task.priority);
        taskCount++;
      });
    });
    expect(taskCount).toBeGreaterThanOrEqual(10);
  });

  it('returns undefined for invalid template ID', () => {
    expect(createPlaybookInstance('non-existent-template')).toBeUndefined();
  });
});
