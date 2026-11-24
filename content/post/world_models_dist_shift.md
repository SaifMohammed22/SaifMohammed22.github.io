---
title: "Do World Models Survive Distribution Shift? A First Attempt with Conformal Prediction"
date: 2026-11-25
summary: "A first attempt at testing CheXWorld under distribution shift with conformal prediction, and what the experiment taught me about its own design"
tags: ["World Model", "Distribution Shift", "Domain Shift"]
author: "Saif Mohammed"
---
As an undergraduate researcher (a humble one) working with Dr. [Jamil Fayyad](https://www.jfayyad.com/), I had the opportunity to work closely with world models, specifically medical world models like [CheXWorld](https://arxiv.org/pdf/2504.13820) [[1]](#ref-1), an image world model for radiograph representation learning. During this time, I tried to answer one question: how does a world model behave under distribution shifts? That is, if I train a world model and give it a fresh data sample that doesn't look like anything it has seen before (out-of-distribution, or OOD), how would it behave?

> This post documents my first research experiment, flaws included. The setup has a mistake that I explain in the discussion, and I'm leaving it in on purpose because I learned more from it than from getting it right the first time.

One hypothesis is that it would handle such samples normally: since world models learn representations rather than raw pixels, they should be more robust to OOD samples, as they look at the core rather than the appearance. However, we needed to examine this behavior empirically, and that's what I did using Conformal Prediction (CP)! (check out my blog on it [here](https://saifmohammed22.github.io/post/conformal-prediction/)).

In a nutshell, conformal prediction is a statistical framework that wraps around a model and turns its outputs into prediction sets with a guaranteed coverage rate (for example, the true answer lands inside the set 90% of the time), as long as the calibration data and the test data are exchangeable. A distribution shift breaks exactly that assumption, which makes it a nice alarm for OOD data.

The idea was as follows:
1. I want to check how world models deal with OOD samples.
2. So, I need a wrapper (a statistical one) to put around my world model that tells me whether its outputs stay reliable on OOD samples. (with a caveat I come back to in the [discussion](#discussion-and-limitations))
3. Then, I need to find a new OOD dataset to feed the model.
4. I need to check empirically that this dataset is actually OOD by comparing it with an in-distribution dataset (i.e., the dataset the model was trained on).
5. Run the model on the new OOD dataset and observe what happens to the wrapper.

But before diving into the details of the experiments and the results, we need to know what a world model even is.

## A Brief History of ~~Time~~ World Models

"World model" is an overloaded term in AI that refers to different things. People in computer vision, robotics, language processing, reinforcement learning, and GenAI all claim that they are building world models. Therefore, there is no single definition that describes them, yet the intuition is the same. A world model, according to Fei-Fei Li [[2]](#ref-2), is a model that learns the structure of the world around it (its spatial and temporal structure), much like how language models learn the structure of text so they can generate and reason about it.

The term itself is new, but the idea of building a model that understands and holds an internal model of the world is much older, dating back to the 1940s. The term was popularized by David Ha and Jürgen Schmidhuber in their 2018 paper "World Models" [[3]](#ref-3). In this paper, they tried to build a model that is trained in an unsupervised manner to learn a compressed spatial and temporal representation of the environment. They called the learned representation **the hallucinated dream**, and the agent can be trained entirely inside it. The model has three main components:
1. Vision module (V): observes the world and compresses it into a latent representation $z$ that still means something about the world but has a much lower dimension.
2. Memory RNN  (M): predicts what should happen next. Given the history $h_t$, the compressed observation $z_t$, and the action $a_t$, this model learns the conditional probability $P(z_{t+1} \mid a_t, z_t, h_t)$.
3. Controller (C): tells us which action to take. It's a linear layer that projects $z$ and $h$ into an action $a$, which changes the state of the environment.

<p align="center">
    <img src="/images/blog/wm_dist_shift/worldmodels.png" alt="Diagram of the World Models architecture: the vision model, memory RNN, and controller interacting with the environment"/>
    <br>
    <em>Source: Ha, David, and Jürgen Schmidhuber. "World models."</em>
</p>

This idea started to get adopted in fields like RL, which led to work like the Dreamer family, which relied on the same idea of learning in imagination since it's more efficient. DreamerV2 was the first agent to reach human-level performance on the Atari benchmark by learning purely inside a world model [[4]](#ref-4). After that, Yann LeCun published his position paper in 2022, "A Path Towards Autonomous Machine Intelligence", which proposed a new training paradigm and architecture for world models: the Joint-Embedding Predictive Architecture (or JEPA for short) [[5]](#ref-5). There, he described a world model as a "kind of simulator of the relevant aspects of world". This led to a whole line of work on world models, from I-JEPA [[6]](#ref-6) and V-JEPA [[7]](#ref-7) to LeWorldModel [[8]](#ref-8) and more. CheXWorld, the model I worked with, belongs to this JEPA family.

<p align="center">
    <img src="/images/blog/wm_dist_shift/jepa.png" alt="Diagram of the JEPA architecture as presented in the CheXWorld paper"/>
    <br>
    <em>The JEPA architecture. Source: Yue, Yang, et al. "Chexworld: Exploring image world modeling for radiograph representation learning."</em>
</p>

Part of why world models are such an interesting topic is that many leading researchers, Fei-Fei Li and Yann LeCun among them, believe they are the next AI frontier. The argument is that the world is not made of words, so building models from language alone won't get us any closer to a model that performs at human level in the real world.

That was a very short intro to the history of world models, they hold much more than that. They are the topic of my bachelor thesis and need a whole series of their own to dive deep into. If you're interested in JEPA and want to know more, check out my teammate [Gad's](https://gad-ma.github.io/) article series about it [here](https://gad-ma.github.io/post/jepa/).

With that context, let's get back to the experiments.

## World Models Under Distribution Shift

Now that we know (roughly) what a world model is, let's see how it behaves under distribution shift.

> Note: all of the experiments here are on CheXWorld.

### Getting the Out-of-Distribution Data

First, let's define what we want to do: we want to test a pretrained world model on out-of-distribution data and see how it responds. So we need new data that the model hasn't seen before. I checked the data CheXWorld was trained on and came up with two datasets that represent different demographics:
1. [CHD-CXR dataset](https://www.kaggle.com/competitions/congenital-heart-disease): a collection of 828 pediatric chest radiographs acquired at Qingdao Women and Children Hospital between 2021 and 2022.
2. [Chest-Xray](https://www.kaggle.com/datasets/tolgadincer/labeled-chest-xray-images): pediatric chest radiographs from Guangzhou Women and Children's Medical Center.

To make sure the new datasets are actually OOD, I took a dataset the model was trained on (a split of CheXpert [[9]](#ref-9)) and compared their statistics, such as mean, std, entropy, and sharpness. They are clearly different, which is a good sign! However, we need a better metric to check whether the new datasets are actually out-of-distribution: the **Mahalanobis distance** [[10]](#ref-10). It measures the distance between a point and a distribution in a correlated space. Euclidean distance falls short in such a space since it only gives us the distance between two points, $d(p, q) = \sqrt{(p_1 - q_1)^2 + (p_2 - q_2)^2 + \dots}$. So, a point inside the distribution and a point outside it could be the same Euclidean distance from the center of the cluster, which is uninformative or even misleading. Hence the need for a metric that tells us how far a point is from a distribution of points.

<p align="center">
    <img src="/images/blog/wm_dist_shift/mahalanobis.png" alt="Illustration of Mahalanobis distance versus Euclidean distance on correlated data"/>
    <br>
    <em>Source: https://machinelearningplus.com/statistics/mahalanobis-distance/</em>
</p>

Its idea is simple: if correlation is the problem, let's decorrelate the values and then calculate the distance.

$$D^2 = (\mathbf{x} - \bar{\mathbf{x}})^T C^{-1} (\mathbf{x} - \bar{\mathbf{x}})$$

where: \
$\mathbf{x}$: an observation vector \
$\bar{\mathbf{x}}$: the vector of mean values \
$C^{-1}$: the inverse of the covariance matrix

<p align="center">
    <img src="/images/blog/wm_dist_shift/chd.png" alt="Statistics of the CHD-CXR dataset compared with CheXpert"/>
    <br>
    <em>The results of comparing CHD-CXR with CheXpert</em>
</p>

<p align="center">
    <img src="/images/blog/wm_dist_shift/chest.png" alt="Statistics of the Chest-Xray dataset compared with CheXpert"/>
    <br>
    <em>The results of comparing Chest-Xray with CheXpert</em>
</p>

As you can see from the figures above, the statistics differ from the baseline dataset. Most importantly, the Mahalanobis distance shows almost zero overlap. Meaning, the new datasets are clearly OOD and ready to be tested.

### Testing the World Model on the OOD Data

Now it's time to see how the world model behaves when we feed it data very different from what it has seen before. But first, we need something to tell us whether the model's outputs stay reliable. Here comes Conformal Prediction. CheXWorld is a JEPA, so it has a natural notion of error: given the image, its predictor tries to predict the target embeddings, and the l2 distance between the predicted and the actual embeddings is how "surprised" the model is. I used this distance as the CP non-conformity score (a higher score means a more surprising image), with a predefined error rate $\alpha = 0.1$ (i.e., 90% target coverage) and 2 seeds per dataset (each with a different random split). For each seed, I randomly split the new OOD dataset into a calibration set and a test set.

The average coverage over the seeds was at least 90% (though one CHD-CXR seed reached only 86.7%). But before getting too excited, there is a catch, which I discuss below.

<p align="center">
    <img src="/images/blog/wm_dist_shift/cp_chest.png" alt="Conformal prediction coverage results on the Chest-Xray dataset"/>
    <br>
    <em>The results of the CP layer with Chest-Xray</em>
</p>

## Discussion and Limitations

On average, the CP layer reached the target coverage on both datasets. However, I have to be honest about what that means. Since the calibration and test sets were both sampled from the same OOD dataset, they are exchangeable by construction, so CP's guarantee holds regardless of how well the model handles the shift. In other words, this experiment shows that CP can be recalibrated on a new domain, not that CheXWorld is robust to it. The encoder's representations might still be great on this data, but this setup can't tell us either way.

### How to fix it

The more informative experiment is to calibrate on in-distribution data (CheXpert) and test on the OOD datasets, with no OOD image used for calibration. In that case, the exchangeability assumption is actually violated, and the coverage tells us something about the shift. It also needs a sanity check: the coverage on a held-out in-distribution split should match the target, otherwise the setup itself is broken.

Other problems and limitations:
- **The setup had flaws beyond the calibration split.** I ran the model on the training split, which applies random augmentations (random crop, horizontal flip, and rotation) to every image, so the scores were noisier than they needed to be. A fixed evaluation transform is the right choice.
- **The score may not react to the shift.** I used the l2 distance between the predicted and the actual target embeddings as the non-conformity score, and I never checked that it actually changes on OOD data.
- **The OOD check was on pixel statistics.** The comparison with CheXpert used four simple statistics (mean, std, entropy, sharpness), so it shows that the images look different, not that the model finds them different.
- **CP was applied to the model's latent prediction error.** I did not build a downstream task (such as a classification head with clinical labels) on top of CheXWorld and wrap CP around it. So this tells us about the model's latent predictions, not a full diagnostic pipeline, which could behave differently under shift.
- **Small test sets.** Each test set had at most 100 images (83 for CHD-CXR), so coverage estimates are noisy.
- **Limited data.** I only tried two datasets and compared them with only one baseline dataset.
- **Few seeds.** I only used 2 seeds per dataset, as I was running my experiments on my laptop with only a CPU. Computing the scores once and resampling the split many times would be a cheaper way to get more seeds.
- **One model.** I only tested this setup on CheXWorld with its released pretrained weights. It would've been great to try it with other models (even non-medical ones).

## Conclusion

So, how do world models behave under distribution shift? Honestly, this experiment with the current setup can't answer that yet. The CP layer stayed on target on both OOD datasets, but since I calibrated and tested on the same OOD data, that only shows CP can be recalibrated to a new domain, not that CheXWorld is robust to it.

What I did get out of it is a lesson in experiment design: a statistical guarantee is only as good as the way you split the data, and a wrapper only tests what you let it test. One more thing you can take from this post: world models are coming, and I'll write more about them later.

## Acknowledgements

Big thanks to Dr. [Jamil Fayyad](https://www.jfayyad.com/) for helping me through this experience and for giving me the opportunity to work on real-world research.

## References
<a id="ref-1"></a>[1] Yue, Yang, et al. "Chexworld: Exploring image world modeling for radiograph representation learning." 2025 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). IEEE, 2025. \
<a id="ref-2"></a>[2] Li, Fei-Fei. "A Functional Taxonomy of World Models." Dr. Fei-Fei Li, 3 June 2026, drfeifei.substack.com/p/a-functional-taxonomy-of-world-models. \
<a id="ref-3"></a>[3] Ha, David, and Jürgen Schmidhuber. "World models." arXiv preprint arXiv:1803.10122 (2018). \
<a id="ref-4"></a>[4] Hafner, Danijar, et al. "Mastering atari with discrete world models." arXiv preprint arXiv:2010.02193 (2020). \
<a id="ref-5"></a>[5] LeCun, Yann. "A path towards autonomous machine intelligence version 0.9. 2, 2022-06-27." Open Review 62.1 (2022): 1-62. \
<a id="ref-6"></a>[6] Assran, Mahmoud, et al. "Self-supervised learning from images with a joint-embedding predictive architecture." 2023 IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR). IEEE, 2023. \
<a id="ref-7"></a>[7] Assran, Mido, et al. "V-jepa 2: Self-supervised video models enable understanding, prediction and planning." arXiv preprint arXiv:2506.09985 (2025). \
<a id="ref-8"></a>[8] Maes, Lucas, et al. "Leworldmodel: Stable end-to-end joint-embedding predictive architecture from pixels." arXiv preprint arXiv:2603.19312 (2026). \
<a id="ref-9"></a>[9] Irvin, Jeremy, et al. "Chexpert: A large chest radiograph dataset with uncertainty labels and expert comparison." Proceedings of the AAAI conference on artificial intelligence. Vol. 33. No. 01. 2019. \
<a id="ref-10"></a>[10] S, Prabhakaran. "Mahalanobis Distance – Understanding the Math With Examples (Python)." Machine Learning Plus, 1 Mar. 2022, machinelearningplus.com/statistics/mahalanobis-distance.