---
title: "Example post: Notes from a data project"
date: 2026-09-27
category: Game Analytics
excerpt: Averages lie, distributions talk — a few lessons from digging through a season of high-level League of Legends matches.
tags: [data, games, analytics]
draft: true
---

**Example content — replace this post with your own writing before publishing.**

The following is fictional demonstration copy, not an account of Arnav’s work.

I've spent the last few months staring at high-level League of Legends matches — over 100,000 of them — trying to turn positions on a map into something a strategist can actually use. Somewhere around match 20,000, I stopped trusting averages.

## Averages lie, distributions talk

The average gold difference at 15 minutes is nearly meaningless. Most games are close; a few are blowouts, and the blowouts drag the mean wherever they want. The moment I switched to looking at distributions — medians, quantiles, the shape of the thing — the data started cooperating.

- **Plot first, summarize later.** Every summary statistic I computed before visualizing was at least slightly wrong in an interesting way.
- **Stratify by context.** Dragon control means something completely different in a 25-minute stomp versus a 45-minute chess match.
- **Position is a feature, not a backdrop.** Where a team stands tells you what they believe about the next 60 seconds.

## Win probability is a story, not a score

The dashboard shows a live win probability curve, and the temptation is to treat it as truth. It's better to treat it as a narrative device: *when* the curve moves tells you which moments mattered. A jungler pathing top at 8 minutes moves the curve more than most teamfights — that surprised me, and it surprised the players I showed it to even more.

```python
# The shape of the analysis, roughly:
# positions -> graph edges -> objective control -> win prob
frames = load_match_frames(match_id)
graph = build_proximity_graph(frames, threshold=1200)
features = objective_control(graph, window="60s")
```

## The dashboard lesson

The hardest part wasn't the modeling — it was the interface. Nobody wants a 40-feature readout mid-argument about draft. The views that survived were the ones that answered one question each: *where were they, what did it win them, and what happens if we change it?*

> If a visualization needs a paragraph to explain, it needs a redesign, not a caption.

I'm still working through this dataset, and I'll write up the graph-modeling details in a follow-up. The code and the explorer are linked from the projects section on the [homepage](/#projects).
