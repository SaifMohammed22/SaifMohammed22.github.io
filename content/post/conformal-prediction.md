---
title: "How to get a classification model to say I don't know?"
date: 2026-06-24
summary: "Conformal Prediction (CP) is one of the interesting approaches for building robust AI models. Let's see what is it and how to use it with a 
          classification model."
tags: ["Deep Learning", "Conformal Prediction"]
author: "Saif Mohammed"
---

Salam!

There is a saying that Egyptian people always say about themselves: "An egyptian never says I don't know". If you asked an egyptian person about anything, quantum physics for example, probably he will think and try to answer even if he don't know what that is. The same thing goes with deep learning models, they tend to give you answers even if they are not sure about it, which is not good at all, especially in critical domains like: medicine and finance. Imagine a classification model that diagnose a disease, if the model got an image which is unfamiliar with it (we say out-of-distribution (OOD)) or a noisy one, it will give you the disease with the highest probability even if this probability is 50% which means that the model isn't confidant or **uncertain** about this prediction.

Here comes the role of conformal prediction: to calibrate the model so that it will be more robust and trustworthy.

During my time at RiSH, I've been reading and working with CP, so today I will share my thoughts on it and build a classification model and add a CP layer to it to see what will change.

