---
title: Gradual Typing in Adelfa
date: Oct 22, 2024
description: Proving type safety in a gradual typing system with Adelfa
---


[Gradual Typing](https://en.wikipedia.org/wiki/Gradual_typing) is a type system
that marries static and dynamic typing. It was developed in 2006 by [Jeremy
Siek](https://wphomes.soic.indiana.edu/jsiek/) and [Walid
Taha](http://www.effective-modeling.org/p/walid-taha.html). Dynamic type systems
offer complete flexibility and agility; whereas static typing offers
type-related error detection earlier. Gradual typing allows us to declare types
as `dynamic` and also specify types. Moreover, we can coerce types to and from
`dynamic` throughout its execution.

I won't be going over Gradual Typing too closely, because Professor Siek
has [his own blog](https://siek.blogspot.com/) you should give a read if
you're interested. This blog post will focus more on mechanizing some
properties of gradual typing in
[Adelfa](http://sparrow.cs.umn.edu/adelfa/index.html), a system I'm
currently using as a graduate student. I plan showing more about Adelfa in a
later post, so I'll just be showing a general thought process involved in
the construction of these theorems. I'll focus on [Gradual Typing for
Functional Languages](http://scheme2006.cs.uchicago.edu/13-siek.pdf) for this
post.


## Syntax of The Language

We elide variables, ground types, constants, etc. since they are not of interest
in any theorems we will mechanize. The paper describes the syntax of $e \in
\lambda^{?}_{\rightarrow}$ in section 1. I'll show the paper's description as
one column and the formulation in Adelfa in the other.


|               | Gradual Typing Syntax   | Adelfa Encoding                   |
| ------------- | ----------------------- | --------------------------------- |
| Type          | $\tau$                  | `ty : type.`                      |
| Function Type | $\tau \rightarrow \tau$ | `arr: {t1: ty}{t2:ty} ty.`        |
| Expressions   | $e$                     | `tm : type.`                      |
| Application   | $e \cdot e$             | `app: {tm1: tm}{tm2: tm} tm.`     |
| Abstraction   | $\lambda x:\tau . e$    | `lam: {ty1:ty}{D: {x:tm} tm} tm.` |


We also define a few extra items in Adelfa:

-   `unit` and `nat`, essentially placeholders to represent more meaningful types in
    an actual system.
-   `dyn` which will represent the $?$ / $\star$ type, standing for dynamic.
-   `empty` and `z` which will be terms we can use of type `unit` and `nat` respectively.

We could use this and then define a system to insert the casts like in the
paper, but I'll only be dealing with the intermediate language of
$\lambda^{\langle \tau \rangle}_{\rightarrow}$ for simplicity. Therefore,
we'll define the cast as well. In the paper this is written as $\langle \tau
\rangle e$ where we are casting $e$ to the target type $\tau$.

Here is the Adelfa section in its entirety:

```lf
tm : type.
ty : type.
arr : {ty1: ty}{ty2:ty} ty.
lam : {ty1: ty}{D: {x:tm} tm} tm.
app : {t1: tm}{t2: tm} tm.
cast : {ty1: ty}{t1: tm} tm.

unit : ty.
dyn : ty.
nat : ty.
empty : tm.
z : tm.
```


## Type Consistency

For a cast to occur between types, the types must be consistent. Consistency is
shown through a $\sim$, so $\tau_{1} \sim \tau_{2}$ is a relation accepting
two types. Here are all the rules for consistency as given in the paper:


```math
{ 
  \over
  \tau \sim \tau
}\mathit{CRefl}
\qquad
{
  \over
  \tau \sim ?
}\mathit{CUnR}
\qquad
{
  \over
  ? \sim \tau
}\mathit{CUnL}
```

```math
{
  \sigma_{1} \sim \tau_{1} \quad \sigma_{2} \sim \tau_{2}
  \over
  \sigma_{1} \rightarrow \sigma_{2} \sim \tau_{1} \rightarrow \tau_{2}
}\mathit{CFun}
```

These can be encoded into Adelfa by first defining a consistency relation that
accepts two types, then we will define each rule based on the input types. Any
conditions that need to be met by the rule can be realized through some
derivation as seen in the `consis-fun` rule.

```lf
consis : {ty1: ty} {ty2: ty} type.
consis-refl: {ty1 : ty} consis ty1 ty1.
consis-dyn-r : {ty1 : ty} consis ty1 dyn.
consis-dyn-l : {ty1 : ty} consis dyn ty1.
consis-fun : {sigma1 : ty}{sigma2 : ty}
             {tau1 : ty}{tau2 : ty}
             {D1: consis sig1 tau1}
             {D2: consis sig2 tau2}
              consis (arr sig1 sig2) (arr tau1 tau2).
```

Now that we have the LF signature finished for the consistency relation, we can
prove properties about it. Let's prove all the points mentioned in
Proposition 1.

-   $\tau \sim \tau$: the relation is reflexive
-   If $\sigma \sim \tau$ then $\tau \sim \sigma$: the relation is commutative.
-   $\neg (\forall \tau_{1} \tau_{2} \tau_{3} . \tau_{1} \sim \tau_{2} \land
      \tau_{2} \sim \tau_{3} \longrightarrow \tau_{1} \sim \tau_{3})$: the relation
    is *not* transitive.


### Reflexive

This arises very naturally from our `consis-refl` rule. So naturally that to prove
it is essentially unnecessary. Nevertheless, here is the proof.

```adelfa
Theorem prop-consis-refl : forall t1,
  {t1: ty} =>
  exists D1, {D1: consis t1 t1}.
intros. exists consis-refl t1. search.
```

## Commutativity

The only tricky aspect of this proof is applying the inductive hypothesis in the
case that it is a function type. The other cases are commutative by the $?$
being on one side or having the same type on both.

```adelfa
Theorem consis-comm : forall t1 t2 D1,
  {D1: consis t1 t2} =>
  exists D2, {D2: consis t2 t1}.
induction on 1.
intros.
case H1.
apply IH to H6. apply IH to H7. 
exists consis-fun tau1 tau2 sig1 sig2 D2 D1. search.
exists consis-dyn-l t1. search.
exists consis-dyn-r t2. search.
exists consis-refl t2. search.
```


## Non-transitivity

We don't have the not ($\neg$) operator, but that's not a problem. We can prove that it
doesn't hold in every case by posing an existential that would lead to a false
assertion. Therefore, we'll formulate the following:

```math
\exists \tau_{1} \tau_2 \tau_3 . \tau_1 \sim \tau_2 \land \tau_2 \sim \tau_3 \implies \tau_1 \sim \tau_3 \implies \bot
```

The transitivity in consistency doesn't work in the case that $\tau_{2}$ is
$?$ and $\tau_1 \not\equiv \tau_3$. Hence, why we cannot prove this with
only `unit` type constructively.

```adelfa
Theorem consis-not-trans : exists t1 t2 t3,
  {t1: ty} => {t2: ty} => {t3: ty} =>
  forall D1 D2 D3,
  {D1: consis t1 t2} /\ {D2: consis t2 t3} =>
  {D3: consis t1 t3} => false.
exists unit.
exists dyn.
exists nat.
intros.
case H5.
```

We have to be careful about this theorem in particular. We could similarly prove
false in this situation if $\tau_{1} \not\sim \tau_{2}$ or $\tau_2 \not\sim
\tau_{3}$. In our case, $() \sim ?$ and $? \sim \mathbb{N}$, and clearly $()
\not \sim \mathbb{N}$, so case analysis will yield $\bot$ but only because
$\tau_1 \not \sim \tau_3$ - and we've shown the property that we'd like to.


<a id="org8d84daa"></a>

# Typing Relations

We'll translate Figure 6's typing derivations for $\lambda^{\langle \tau
\rangle}_{\rightarrow}$ into Adelfa piece by piece. Just as before, we'll place
any preconditions of the relation into some derivation necessary for the
relation to hold.

```math
\boxed{\Gamma \vert \Sigma \vdash e : \tau}
```

```lf
of : {t1: tm}{ty1 : ty} type.
```

```math
{
\Gamma (x \mapsto \sigma) \vert \Sigma \vdash e : \tau
\over
\Gamma \vert \Sigma \vdash \lambda x : \sigma . e : \sigma \rightarrow \tau
  
}\mathit{TLam}
```
    
```lf
of-lam : {t1:{x:tm}tm}{ty1:ty}{ty2:ty}
          {D:{x:tm}{D': of x ty1} of (t1 x) ty2}
          of (lam ty1 ([x] t1 x)) (arr ty1 ty2).
```

```math
{
\Gamma \vert \Sigma \vdash e_{1} : \tau \rightarrow \tau^{\prime} \quad \Gamma \vert \Sigma \vdash e_2 : \tau
\over
\Gamma \vert \Sigma \vdash e_1 e_2 : \tau^{\prime}
}\mathit{TApp}
```

```lf
of-app : {t1: tm}{t2:tm}{ty1: ty}{ty2:ty}
            {D1: of t1 (arr ty1 ty2)}
            {D2: of t2 ty1}
            of (app t1 t2) ty2.
```
```math
{
\Gamma \vert \Sigma \vdash e : \sigma \quad \sigma \sim \tau
\over
\Gamma \vert \Sigma \vdash \langle \tau \rangle e : \tau
}\mathit{TCast}
```
    
```lf
of-cast : {t1: tm}{ty1: ty}{ty2: ty}
            {D1: of t1 ty2}
            {D: consis ty1 ty2}
            of (cast ty2 t1) ty2.
```

In addition, the typing derivations listed in the paper, we have to add ones
for the new terms `empty` and `z` that we've derived.

```math
{
  \over
  \Gamma \vert \Sigma \vdash \langle \rangle : ()
}\mathit{TEmpty}
```

```lf
of-empty : of empty unit.
```

```math
{
  \over
  \Gamma \vert \Sigma \vdash 0 : \mathbb{N}
}\mathit{TZero}
```

```lf
of-z : of z nat.
```


## Context Lemmas & Type Equality

To translate this into Adelfa, we need to account for abstraction capturing a
variable in the context. Adelfa addresses this problem through a context
schema. In this instance we define it as `Schema c := {T}(x: tm, y: of x T)`.

We also don't have a built-in way to determine type equality, we'll define
one. It turns out, equality by reflexivity is sufficient for our needs.

```lf
ty-eq : {ty1:ty}{ty2:ty} type.
ty-eq-refl : {ty1:ty} ty-eq ty1 ty1.
```

These are not relating directly to gradual typing, but are more properties of
any typing relation. Firstly, a type in a context is also a type not in a
context: $\Gamma \vdash \tau \implies \varnothing \vdash \tau$.

```adelfa
Theorem ty-independent : ctx G:c, forall T,
  {G |- T: ty} => {T: ty}.
induction on 1.
intros.
case H1. search. search. search.
apply IH to H2.
apply IH to H3. search.
```

Secondly, type equality also doesn't depend on a context: $\Gamma \vdash \tau
= \tau^{\prime} \implies \varnothing \vdash \tau = \tau^{\prime}$.

```adelfa
Theorem eq-independent : ctx G:c, forall t1 t2 D1,
  {G |- D1: ty-eq t1 t2} => {D1: ty-eq t1 t2}.
intros.
case H1.
apply ty-independent to H2.
search.
```


## Type Uniqueness

Let's look at Lemma 2.

```math
\Gamma \vert \Sigma \vdash e : \tau \land \Gamma \vert \Sigma \vdash e : \tau^{\prime} \implies \tau = \tau^{\prime}
```

We then translate this into Adelfa as such

```adelfa
Theorem ty-uniq-lem : ctx G:c, forall E t1 t2 D1 D2,
  {G |- t1: ty} => {G |- t2: ty} =>
  {G |- D1: of E t1} => {G |- D2: of E t2} =>
  exists D3, {G |- D3: ty-eq t1 t2}.
induction on 3.
intros.
case H3.
case H4.
exists ty-eq-refl t2. search.
case H4.
apply IH to H7 H11 H8 H12.
case H13.
exists ty-eq-refl (arr ty1 t4). search.
case H4.
assert {G |- (arr ty1 t1): ty}. search.
assert {G |- (arr ty2 t2): ty}. search.
apply IH to H17 H18 H9 H15.
case H19.
exists ty-eq-refl t2. search.
case H4.
exists ty-eq-refl (t2 n n1). search.
```

Which is:

```math
\Gamma \vert \Sigma \vdash e : \tau \land \Gamma \vert \Sigma \vdash e : \tau^{\prime} \implies \Gamma \vert \Sigma \vdash \tau = \tau^{\prime}
```

So, to take the context off of the consequent, we only have to apply our
equality independent lemma.

```adelfa
Theorem ty-uniq : ctx G:c, forall E T1 T2 D1 D2,
  {G |- T1: ty} => {G |- T2: ty} =>
  {G |- D1: of E T1} => {G |- D2: of E T2} =>
  exists D3, {D3: ty-eq T1 T2}.
intros.
apply ty-uniq-lem to H1 H2 H3 H4.
apply eq-independent to H5.
exists D3.
search.
```


## Preservation

Stated simply, "reduction preserves types" is the principle we want to prove. We
need a reduction strategy. The paper uses big step semantics, but I'll use small
step which will display the next step that a term will take. These steps will
occur until we reach a value. We define values to be:

-   Lambdas: $\lambda x : \tau . e$
-   Casts: $\langle \tau \rangle e$
-   Empty: $\langle \rangle$
-   Zero: $0$

```lf
value : {t1: tm} type.
value-lam : {ty1: ty}{D: {x:tm} tm} value (lam ty1 ([x] D x)).
value-cast : {t1: tm}{ty1: ty} value (cast ty1 t1).
value-empty: value empty.
value-z : value z.
```

We then have to define how our program will actually execute through the lambda
terms. I'll use the single step notation of $e \rightsquigarrow e^{\prime}$ to
denote that $e$ reduces to $e^{\prime}$ in a single step. We define a set of
reduction rules such that we know the exact reduction step the program will take
at any moment. For example, if we have two lambda terms $e_1$ and $e_2$
being applied, $e_1 \cdot e_2$, then we could reduce the left $e_{1}
\rightsquigarrow e_1^{\prime}$ or the right $e_{2} \rightsquigarrow
e_2^{\prime}$, or it could be the tricky case that $e_1$ is of function type
$\sigma_1\rightarrow\sigma_2$ and needs to be expanded into a lambda term. We
solve this issue by using the following order:

1.  Reduce the left side until it is a value.
2.  Reduce the right side until it is a value.
3.  If the left side has a cast, we can remove it.
4.  Expand the left side into a lambda abstraction.

These are captured in the following definitions:

```lf
step : {t1: tm}{t2: tm} type.
step-app-1 : {E1: tm}{E2: tm}{E1': tm}{D: step E1 E1'}
              step (app E1 E2) (app E1' E2).
step-app-2 : {E1: tm}{E2: tm}{E2': tm}{D1: step E2 E2'}
              {D2: value E1}
              step (app E1 E2) (app E1 E2').
step-app-beta : {E: {x:tm} tm}{T: ty}{E2:tm}{D1:value E2}
                step (app (lam T ([x] E x)) E2) (E E2).
step-app-cast: {E1: tm}{E2: tm}{ty1: ty}{ty2: ty}
                step (app (cast (arr ty1 ty2) E1) E2) (app E1 E2).
```

Which captures all $t1 \rightsquigarrow t2$ relations. The precision in which
we defined `step` will come in handy when we move onto proving progress.

Before we move onto preservation, let's prove a corollary that states values
cannot take any more steps.

```adelfa
Theorem value-no-red : forall E V E' D2,
  {V: value E} => {D2: step E E'} => false.
intros.
case H1.
case H2.
case H2.
case H2.
case H2.
```

This isn't necessary for proving preservation, but is a nice way to confirm our
internal idea of what a `value` is. Looping back to preservation, we can prove
this without too much difficulty.

```adelfa
Theorem preserv : forall E E' T D1 D2,
  {D1: step E E'} =>
  {D2: of E T} =>
  exists E, {E : of E' T}.
induction on 1.
intros.
case H1.
case H2.
case H11.
inst H16 with n2 = E2.
inst H17 with n3 = D6.
exists D7 E2 D6. search.
case H2.
apply IH to H6 H13.
exists of-app E1 E2' ty1 T D5 E. search.
case H2.
apply IH to H6 H11.
exists of-app E1' E2 ty1 T E D4. search.
```


## Progress

Progress states that when we are evaluating a term, are able to either take a
step or we have reached a value. Progress and preservation together constitute
"type-safety" of a system. We've already defined values and steps we can take
within our language, so proving progress doesn't require too much more
information.

The only new definitions we need are that of a *canonical* form. Well typed values
have to be in a canonical form. When we have reached a point where we have $e_1
\cdot e_2$, we want to limit the forms of $e_1$ to ones where $e_1$ is a
cast $\langle \tau_1 \rightarrow \tau_2 \rangle e_1$ or of function type, and
can be expanded into a lambda $e_1 : \tau_1 \rightarrow \tau_2 \Rightarrow
(\lambda x : \tau_1 . e_1^{\prime}) : \tau_2$. Any other form for $e_1$ would
not lead to a well typed term. We want to list all canonical forms:

```lf
canonical : {t1 : tm} {ty1: ty} type.
canonical-lam : {t1: {x:tm} tm} {ty1: ty} {ty2: ty}
                canonical (lam ty1 ([x] t1 x)) (arr ty1 ty2).
canonical-empty : canonical empty unit.
canonical-z : canonical z nat.
canonical-cast : {t1: tm} {ty1 : ty}
                  canonical (cast ty1 t1) ty1.
```

And formulate a theorem about well typed values being canonical:

```adelfa
Theorem canonical : forall E T D1 D2,
  {D1: of E T} =>
  {D2: value E} => exists D3, {D3: canonical E T}.
intros.
case H1.
exists canonical-z. search.
exists canonical-empty. search.
case H2.
exists canonical-cast t1 T. search.
exists canonical-lam t1 ty1 ty2. search.
case H2.
```

We're now able to prove progress.

```adelfa
Theorem progress : forall E D1 ty1,
  {E: tm} => {D1: of E ty1} =>
  (exists E' D2, {D2: step E E'} /\ {E' : tm}) \/ (exists D3, {D3: value E}).
induction on 1.
intros.
case H1.
right.
exists value-z. search.
right.
exists value-empty. search.
case H2.
right.
exists value-cast t1 ty2. search.
case H2.
apply IH to H3 H9. case H11. case H11.
left.
exists app E' t2.
exists step-app-1 t1 t2 E' D1.
split. search. search.
apply IH to H4 H10. case H12. case H12.
left.
exists app t1 E'.
exists step-app-2 t1 t2 E' D4 D1.
split. search. search.
left.
apply canonical to H9 H11. case H13. case H9.
exists app t3 t2.
exists step-app-cast t3 t2 ty2 ty1. split. search. search.
inst H14 with n = t2.
exists t3 t2.
exists step-app-beta t3 ty2 t2 D4. split. search. search.
right.
exists value-lam ty2 D.
search.
```
