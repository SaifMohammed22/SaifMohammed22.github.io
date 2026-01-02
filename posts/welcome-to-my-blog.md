---
title: Welcome to My Blog
date: 2026-01-01
summary: Excited to start sharing my thoughts on AI, Machine Learning, and my journey as an engineering student.
tags: [Personal, Introduction]
---

Hello and welcome to my blog! 👋

I've decided to start documenting my journey in the world of AI and Machine Learning. This space will be a collection of my thoughts, learnings, and experiences as I navigate through this exciting field.

## What to Expect

Here's what I plan to share:

- **Technical Deep Dives**: Breaking down complex ML concepts into digestible pieces
- **Project Updates**: Behind-the-scenes looks at my ongoing projects
- **Learning Notes**: Key takeaways from papers, courses, and experiments
- **Career Reflections**: Thoughts on growing as an engineering student

## Adding Code is Easy

Just use triple backticks with the language name:

```python
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(784, 10)
    
    def forward(self, x):
        return self.fc(x)

model = SimpleNet()
print(f"Parameters: {sum(p.numel() for p in model.parameters())}")
```

## Add maths with LaTeX

$$w_{i} = w_{i-1} + \eta \frac{\partial L}{\partial w_{i-1}}$$


## Why Start a Blog?

Writing helps me clarify my thinking. By explaining concepts, I understand them better myself. Plus, if my notes can help someone else on their journey, that's a win-win!

Stay tuned for more posts!
