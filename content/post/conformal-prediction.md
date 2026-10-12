---
title: "How to get a classification model to say \"I don't know\"?"
date: 2026-10-13
summary: "Conformal Prediction (CP) is one of the most interesting approaches for building trustworthy AI models. Let's see what it is and how to use it with a classification model."
tags: ["Deep Learning", "Conformal Prediction"]
author: "Saif Mohammed"
---

<p align="center">
    <img src="/images/blog/meme1.gif" alt="Model confidently giving wrong answers meme"/>
</p>

There's a saying Egyptians always joke about themselves: "An Egyptian never says I don't know." If you asked an Egyptian about anything — quantum physics, for example — he'd probably stop, think, and try to answer even if he has no idea what it is. The same thing goes for deep learning models: they tend to give you an answer even when they're not sure about it, which is not good at all, especially in critical domains like medicine and finance. Imagine a classification model that diagnoses a disease: if it gets an image it's unfamiliar with (we call this out-of-distribution, or OOD) or a noisy one, it will still output the disease with the highest probability — even if that probability is only 50%, which means the model isn't confident, i.e. it is **uncertain** about this prediction. Worse, softmax scores can be high even when the model has no business being confident.

Here comes the role of conformal prediction: to give the model a way to say "I'm not sure" in a principled, trustworthy way.

During my time at [RiSH](https://risingsh.github.io/website/), I've been reading about CP and working with it, so today I'll share my thoughts on it. And maybe later, I'll share with you my work on [Robust~~Ness~~Net](https://github.com/SaifMohammed22/RobustNet.git) and how I trained a classification model, and added a CP layer on top of it, and see what changes.

## So, what is Conformal Prediction?
Conformal Prediction (or CP for short) is a wrapper that makes your model's uncertainty explicit. It takes any pretrained model (e.g., a classification model $\hat{f}$) and turns it from a model that gives a point-estimate output (a single prediction) into a model that outputs a *set* of predictions that contains the correct answer with a user-defined coverage level $1 - \alpha$, where $\alpha \in (0, 1)$.

In other words, if you feed an unfamiliar sample to a classifier that isn't really sure about the output, then instead of handing you the top probability (which could be 50% or lower!) and telling you "this is the answer," it returns a set of predictions that contains the correct answer with a specific certainty (say, 90%). A confident prediction might look like $\{\text{cat}\}$, while an uncertain one might look like $\{\text{cat}, \text{squirrel}, \text{fox}\}$. **That big set is the model's way of saying "I'm not sure"** — and it's the cue for a human to step in. An *empty* set is possible too: it means no class looked convincing enough, which is another way of saying "I'm not sure." Such behavior might be tolerable if I have a classifier separating cats from squirrels, but in more critical scenarios — like medicine and finance — being overconfident like this is very risky. That's the idea behind conformal prediction: it doesn't touch your model, it just wraps it to make it more trustworthy.

### Are there any assumptions before applying CP?
Only one assumption, and it's a critical one: *exchangeability*[^1] — or, to sound a bit fancier, your data should be i.i.d.[^2] (independent and identically distributed). If you break this assumption, the guarantee no longer holds.

This also means a subtle thing: the formal guarantee covers new data that looks like your calibration data. For truly OOD inputs the guarantee doesn't formally apply, but in practice the prediction sets tend to either grow or, with this score, even become empty, and both are signals that the model is unsure.

## So, how do we use CP?
The steps of CP are fairly simple, and we'll assume we already have a trained classification model.

Our setup is:

We have a fitted model $\hat{f}$ and a moderately sized set of labeled data the model hasn't seen during training (e.g., $n = 1000$ points) $\{(X_i, Y_i)\}_{i=1}^n$. Our goal is to find a prediction set $C$ that takes an input $X_{test}$ and outputs a subset of labels $1 \dots K$, i.e. $C(X_{test}) \subset \{1, \dots, K\}$, such that

$$1 - \alpha \leq P(Y_{test} \in C(X_{test})) \leq 1 - \alpha + \frac{1}{n + 1}$$

where $(X_{test}, Y_{test})$ is a new, fresh data point ***from the same distribution*** (a very important point — see [Are there any assumptions before applying CP?](#are-there-any-assumptions-before-applying-cp)). If this assumption is violated, we're out of luck.

We can interpret this equation as: our label is guaranteed to land inside the prediction set with probability at least $1 - \alpha$. Note that this is an *average* guarantee over the calibration data and the test point, not a promise for every single input.

So, what are the steps to get the prediction set $C(X_{test})$?

1. Set aside $n$ labeled samples that the model was **not** trained on. We'll call these the calibration data (the larger $n$ is, the tighter the coverage).
2. Run a forward pass on the calibration data $\{(X_i, Y_i)\}_{i=1}^n$ to get the model's softmax scores (for multiclass classification) $\hat{f}(X_i)$.
3. Compute the so-called conformal scores: $s_i = 1 - \hat{f}(X_i)_{Y_i}$ for all $i$, where $\hat{f}(X_i)_{Y_i}$ is the softmax score of the true class and sort it. This gives you a set of conformal scores $\{s_1, \dots, s_n\}$ — the lower the score, the better the model agrees with the truth.
4. Compute $\hat{q}$ as the $\frac{\lceil (n+1)(1 - \alpha) \rceil}{n}$ quantile of $\{s_1, \dots, s_n\}$.
5. For a new point $X_{new}$, the prediction set is $C(X_{new}) = \{y: \hat{f}(X_{new})_y \geq 1 - \hat{q}\}$, which guarantees $1 - \alpha$ (e.g., 90%) coverage. That is, $Y_{new}$ will fall inside the prediction set at least 90% of the time.

Intuitively, step 5 says: keep every class whose softmax score is high enough. 

An important question is: why do we use $1 - \hat{q}$ in the last step instead of $\hat{q}$? Basically, because $\hat{q}$ was computed over the sorted conformal scores $s_i = 1 - \hat{f}(X_i)_{Y_i}$, so it lives on the *score* scale, not the *probability* scale. We keep every class whose score is at or below $\hat{q}$, i.e. $s_{new}(y) \leq \hat{q}$, which is the same as $1 - \hat{f}(X_{new})_y \leq \hat{q}$. Thus, with a bit of flipping, we get $\hat{f}(X_{new})_y \geq 1 - \hat{q}$, which is exactly the threshold on the softmax scores that we use in step 5.

> Refer to [[1]](#ref-1) section 1 for a code snippet to clear things up.

<p align="center">
  <img src="/images/blog/steps.png" alt="Steps to construct the conformal prediction set" />
  <br>
  <em>Source: A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification</em>
</p>

Now you have a prediction set that stays small when the model is sure of its answer, and grows (or even comes back empty) as the model becomes more hesitant. This is where the human can step into the loop and save the situation.

<p align="center">
    <img src="/images/blog/image.png" alt="Conformal prediction sets grow with uncertainty"/>
    <br>
    <em>Source: A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification</em>
</p>

## The end

That was a very brief intro to **Conformal Prediction** from my humble point of view and understanding. However, CP holds much more than that, and you can find way more details in the cool [References](#references) below.

>Note: This is not educational content by any means. It's just a way to share my understanding with people, which might be right or wrong. I believe the best way to learn is to ~~teach~~ share your thoughts.

## References
<a id="ref-1"></a>[1] Angelopoulos, Anastasios N., and Stephen Bates. “A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification.” arXiv:2107.07511. Preprint, arXiv, December 7, 2022. https://doi.org/10.48550/arXiv.2107.07511.

<a id="ref-2"></a>[2] Tibshirani, R. (2023). Conformal prediction. https://www.stat.berkeley.edu/%7Eryantibs/statlearn-s23/lectures/conformal.pdf


[^1]: Exchangeability means nothing changes if we permute the data — formally, the joint distribution stays the same under any reordering: $P(X_1, \dots, X_n) = P(X_{\sigma(1)}, \dots, X_{\sigma(n)})$ for any permutation $\sigma$.

[^2]: Although I'm using the two terms interchangeably here, Prof. Tibshirani notes in [[2]](#ref-2) that *exchangeability* is a weaker assumption than *i.i.d.*: i.i.d. data is always exchangeable, but being invariant to permutation doesn't imply independence.