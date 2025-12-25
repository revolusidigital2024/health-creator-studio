import { useState, useEffect, useMemo } from 'react';
import { Project, OutlineSection } from '../types';

// --- LOGIC: KALKULATOR SKOR KUALITAS (Pure Function) ---
export const calculateQualityScore = (project: Project) => {
  let score = 0;
  if (!project.data) return 0;

  // 1. Judul & Konsep (10%)
  if (project.title && project.data.topic) score += 10;

  // 2. Naskah Lengkap (30%)
  const outline = project.data.blueprint?.outline || [];
  const segmentsFilled = outline.filter((s: OutlineSection) => s.scriptSegment && s.scriptSegment.length > 50).length;
  
  if (outline.length > 0 && segmentsFilled === outline.length) {
    score += 30; // Full Naskah
  } else if (segmentsFilled > 0) {
    score += 15; // Setengah jalan
  }

  // 3. Visual Ready (20%)
  if (project.data.blueprint?.visualScenes && project.data.blueprint.visualScenes.length > 0) {
    score += 20;
  }

  // 4. Audio Ready / SSML (20%)
  if (project.data.blueprint?.ssmlScript) {
    score += 20;
  }

  // 5. PACKAGING READY (20%)
  if (project.data.blueprint?.packaging) {
    score += 20;
  }

  return Math.min(score, 100);
};

export const useProjectDashboard = (projects: Project[]) => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'list' | 'board'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('dashboard_view_mode') as 'list' | 'board') || 'list';
    }
    return 'list';
  });
  
  const [activeTab, setActiveTab] = useState<'All' | 'Idea' | 'Published'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Persist View Mode
  useEffect(() => {
    localStorage.setItem('dashboard_view_mode', viewMode);
  }, [viewMode]);

  // --- FILTER LOGIC ---
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesTab = activeTab === 'All' ? true : p.status === activeTab || (activeTab === 'Idea' && p.status !== 'Published');
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [projects, activeTab, searchQuery]);

  // --- LOGIC: HITUNG SKOR OTORITAS CHANNEL ---
  const authorityScore = useMemo(() => {
    if (projects.length === 0) return 0;
    const totalScore = projects.reduce((acc, p) => acc + calculateQualityScore(p), 0);
    return Math.round(totalScore / projects.length);
  }, [projects]);

  return {
    viewMode, setViewMode,
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    filteredProjects,
    authorityScore
  };
};
