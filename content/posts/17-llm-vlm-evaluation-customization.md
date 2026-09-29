---
layout:       post
title:        "LLM/VLM 평가 프레임워크 커스터마이징?"
date: '2026-09-29'
section: 'infra'
excerpt: 'LM-Eval-Harness, LMMs-Eval, VLMEvalKit에 평가셋·채점 로직·모델 어댑터를 추가하는 방법'
tags: ['LLM', 'VLM', 'Evaluation', 'Kubernetes']
---

LLM이나 VLM을 서비스에 붙이다 보면, 어떤 모델을 사용할지 비교해야 하는 순간이 생긴다.

공개 벤치마크 점수를 참고할 수는 있지만, 우리 서비스에서 필요한 능력까지 그대로 보여주는 것은 아니다.  
한국어 사내 문서에서 답을 찾는 능력, 이미지 속 표를 읽는 능력, Kubernetes 장애의 원인을 설명하는 능력은 각각 따로 확인할 필요가 있다.

이때 사용할 수 있는 도구가 **평가 프레임워크**다.

평가할 문제를 넣고, 여러 모델의 응답을 받아, 정해진 기준으로 점수를 계산하는 과정을 반복할 수 있게 해준다. 여기에 업무에 맞는 데이터와 채점 기준을 추가하는 것이 **평가 프레임워크 커스터마이징**이다.

대표적인 프레임워크 세 가지를 살펴보고, 실제로 어떤 부분을 확장하는지 정리해보려고 한다. 아래 데이터와 코드는 구조를 설명하기 위한 예시다.

<br>

# 1. 어떤 프레임워크가 있을까?

| 프레임워크 | 주로 다루는 대상 | 쉽게 말하면 |
| --- | --- | --- |
| **LM-Eval-Harness** | 텍스트 LLM 중심 | 언어 모델의 시험 실행과 채점을 자동화하는 프레임워크 |
| **LMMs-Eval** | 텍스트·이미지·영상·음성 | 여러 종류의 입력을 다루는 멀티모달 평가 프레임워크 |
| **VLMEvalKit** | 이미지·영상 기반 Vision-Language Model | 다양한 VLM과 시각 이해 벤치마크를 연결하는 평가 툴킷 |

LLM은 Large Language Model, VLM은 Vision-Language Model을 의미한다.  
LMM은 Large Multimodal Model로, 텍스트 외에 이미지·영상·음성 등을 함께 처리하는 모델을 가리킨다. 다만 모든 LMM이 모든 입력 형식을 지원하는 것은 아니다.

## 1-1. LM-Eval-Harness

정식 저장소 이름은 EleutherAI의 `lm-evaluation-harness`다.

MMLU, GSM8K, HellaSwag 같은 평가 task를 공통 인터페이스로 실행하고, Hugging Face 모델이나 vLLM, API 기반 모델 등을 연결할 수 있다. 공개된 task 외에도 로컬 데이터와 커스텀 평가 지표를 사용할 수 있다. [공식 저장소](https://github.com/EleutherAI/lm-evaluation-harness)

여기서 **task**는 평가에 필요한 설정과 로직을 묶은 단위라고 보면 된다.

```text
평가 데이터 + 프롬프트 + 채점 기준
               ↓
        LM-Eval-Harness
               ↓
         평가할 모델 호출
               ↓
      응답 또는 로그 확률 수집
               ↓
          점수 계산·집계
```

텍스트 평가라고 해서 모두 모델의 답변을 생성한 뒤 문자열을 비교하는 것은 아니다.

예를 들어 객관식 task는 각 선택지의 **로그 확률(log likelihood)** 을 비교할 수 있고, 생성형 QA는 모델이 생성한 답을 정답과 비교할 수 있다. 모델 어댑터가 어떤 요청을 지원하는지도 함께 확인해야 한다. [모델 인터페이스 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/model_guide.md)

텍스트 평가를 중심으로 발전한 프로젝트지만, 이미지와 텍스트를 함께 입력하는 실험적 멀티모달 기능도 있다. 따라서 텍스트만 지원하는 도구로 구분하기보다는 **텍스트 LLM 평가가 중심인 도구**로 이해하는 편이 맞다. [멀티모달 지원 안내](https://github.com/EleutherAI/lm-evaluation-harness)

## 1-2. LMMs-Eval

**LMMs-Eval**은 LM-Eval-Harness에서 출발한 멀티모달 평가 프레임워크다. 이미지·영상·음성 등을 사용하는 task와 모델을 공통 파이프라인에서 평가하는 데 초점을 둔다. [공식 저장소](https://github.com/EvolvingLMMs-Lab/lmms-eval)

```text
이미지 + 질문 → 이미지에 대한 답변
영상   + 질문 → 장면이나 행동에 대한 답변
음성   + 질문 → 음성 내용에 대한 답변
```

예를 들어 사내 문서 이미지 1,000장을 가지고 문서 QA 평가를 만든다고 해보자.

문서마다 질문과 정답을 준비하고, 문서 이미지를 읽는 함수와 질문을 구성하는 함수, 답변을 채점하는 함수를 task에 연결한다. 그러면 같은 평가셋으로 여러 VLM을 비교하는 구조를 만들 수 있다.

YAML과 Python 함수를 함께 사용하며, `doc_to_visual`, `doc_to_text`, `doc_to_messages` 같은 입력 구성 지점과 `process_results` 같은 채점 지점을 확장할 수 있다. 사용하는 모델 인터페이스에 맞춰 이미지·텍스트 또는 메시지 구조를 구성한다. [Task 작성 문서](https://github.com/EvolvingLMMs-Lab/lmms-eval/blob/main/docs/guides/task_guide.md)

문서 QA를 설계할 때는 **이미지에서 글자를 읽었는지**와 **읽은 내용을 바탕으로 질문에 답했는지**도 구분할 수 있다. 금액 추출 문제와 표의 여러 행을 비교하는 문제를 나누면, 전체 평균만 볼 때보다 실패 원인을 파악하기 쉽다.

## 1-3. VLMEvalKit

OpenCompass 프로젝트의 **VLMEvalKit**도 VLM 평가에 사용하는 오픈소스 툴킷이다. 이미지뿐 아니라 영상 벤치마크도 지원한다. MMBench, MMMU, MathVista, OCRBench, DocVQA, ChartQA 등이 대표적인 평가 대상이다. [공식 저장소](https://github.com/open-compass/VLMEvalKit)

특징 중 하나는 모델이 자유롭게 생성한 응답에서 **채점할 답을 추출하는 과정**이다.

```text
정답: B

모델 응답: "The correct answer is B because ..."
                         ↓
                    답변 추출
                         ↓
                         B
                         ↓
                    정답과 비교
```

전체 문장을 그대로 비교하면 오답이 되지만, 선택지만 추출하면 정답으로 처리할 수 있다. VLMEvalKit은 exact matching과 LLM 기반 answer extraction을 사용하는 평가 방식을 제공한다. 적용되는 방식은 벤치마크와 설정에 따라 달라진다. [평가 방식 소개](https://github.com/open-compass/VLMEvalKit)

신규 벤치마크는 dataset 클래스로 구성하며, `build_prompt()`에서 모델 입력을 만들고 `evaluate()`에서 결과를 채점하는 구조다. 새 모델은 모델 인터페이스에 맞춰 추론 함수를 구현해 연결한다. [개발 문서](https://github.com/open-compass/VLMEvalKit/blob/main/docs/en/Development.md)

## 1-4. LMMs-Eval과 VLMEvalKit의 차이

두 도구의 영역은 상당히 겹친다.

LMMs-Eval은 이미지·영상·음성을 아우르는 평가 흐름을 살펴볼 때, VLMEvalKit은 다양한 시각 이해 벤치마크와 VLM의 조합을 살펴볼 때 출발점으로 삼을 수 있다. 이는 각 프로젝트가 강조하는 범위를 기준으로 한 구분이다.

실제로 선택할 때는 **평가하려는 데이터 형식, 모델 어댑터, 벤치마크의 채점 방식이 이미 구현되어 있는지**를 먼저 확인하면 된다. 영상 평가가 필요하다는 이유만으로 둘 중 하나가 자동으로 결정되는 것은 아니다.

<br>

# 2. 커스터마이징은 어디를 수정하는 걸까?

평가 흐름을 나누어 보면 수정할 지점이 보인다.

```text
평가셋 로딩
    ↓
질문·문맥·이미지 등 입력 구성
    ↓
모델 어댑터를 통해 추론 요청
    ↓
출력 파싱·정규화
    ↓
문항별 채점
    ↓
전체·유형별 점수 집계
```

| 수정 지점 | 추가하는 내용의 예시 |
| --- | --- |
| 평가셋 / task | 한국어 QA, 사내 문서, 장애 시나리오를 읽는 로직 |
| 프롬프트 | 질문과 문맥을 배치하는 순서, 응답 형식, few-shot 예시 |
| 모델 어댑터 | 사내 추론 서버의 요청·응답 형식, 이미지 전송 방식 |
| 출력 후처리 | JSON 파싱, 선택지 추출, 공백·표기 정규화 |
| 채점 로직 | 정답 일치, 수치 오차 허용, 필수 항목 충족, LLM 기반 채점 |
| 실행·집계 | 여러 모델 반복 실행, 유형별 결과, CI나 학습 파이프라인 연결 |

새로운 평가셋을 추가하는 작업과 새로운 모델을 연결하는 작업은 서로 구분된다. 기존 모델 어댑터를 그대로 사용하면서 task만 추가할 수도 있고, 기존 벤치마크에 사내 모델 어댑터만 연결할 수도 있다.

또한 커스터마이징을 위해 항상 프레임워크의 핵심 코드를 수정할 필요는 없다. 외부 task YAML이나 제공되는 확장 지점으로 해결할 수 있는지 먼저 확인하면, 이후 원본 프로젝트의 업데이트를 반영하기도 편하다. LM-Eval-Harness는 외부 task 경로와 별도 플러그인 등록 방식도 제공한다. [CLI 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/interface.md)

<br>

# 3. LM-Eval-Harness에 평가셋 추가하기

간단한 한국어 단답형 QA를 예시로 보면 구조를 이해하기 쉽다.

아래는 **2026년 9월에 확인한 공식 문서의 인터페이스를 기준으로 작성한 구성 예시**다. 실제 평가 점수를 측정한 결과는 아니며, 실행 환경의 패키지 버전과 모델 요구사항에 맞춰 사용해야 한다.

## 3-1. 로컬 데이터 준비

프로젝트 디렉터리를 아래처럼 구성한다.

```text
eval-project/
├── data/
│   └── company_qa.jsonl
└── tasks/
    └── company_qa.yaml
```

`company_qa.jsonl`에는 한 줄에 하나의 문항을 저장한다. 아래 두 문항은 연결 구조를 확인하기 위한 예시이며, 모델의 성능을 판단할 규모의 평가셋은 아니다.

```json
{"id":"k8s-001","question":"Kubernetes 컨테이너가 메모리 제한을 초과해 종료되었을 때 기록되는 종료 사유는?","answer":"OOMKilled"}
{"id":"k8s-002","question":"Kubernetes Service에서 연결할 Pod를 레이블로 선택하는 spec 하위 필드는?","answer":"selector"}
```

평가셋은 Hugging Face Hub에 공개할 필요 없이 로컬 파일로도 불러올 수 있다. `dataset_path`에 파일 형식을, `dataset_kwargs`에 파일 경로를 지정한다. [로컬 데이터셋 사용 방법](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/new_task_guide.md#using-local-datasets)

## 3-2. Task 정의

`tasks/company_qa.yaml` 파일을 작성한다.

```yaml
task: company_qa
dataset_path: json
dataset_kwargs:
  data_files:
    test: ./data/company_qa.jsonl
test_split: test

output_type: generate_until
num_fewshot: 0

doc_to_text: |-
  다음 질문에 설명 없이 정답 용어만 답하세요.
  질문: {{question}}
  답변:
doc_to_target: "{{answer}}"

generation_kwargs:
  do_sample: false
  max_gen_toks: 64

metric_list:
  - metric: exact_match
    aggregation: mean
    higher_is_better: true

metadata:
  version: 1.0
```

`doc_to_text`는 모델에게 전달할 입력이고, `doc_to_target`은 채점에 사용할 정답이다. **정답 필드는 모델 입력에 포함하지 않는다.**

`generate_until`은 답변을 생성하는 방식이며, 여기서는 `exact_match`로 정답과 비교한다. `aggregation: mean`은 문항별 점수를 평균 내도록 지정한다. 각 필드와 후처리 필터의 구성은 [Task 설정 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/task_guide.md)에서 확인할 수 있다.

## 3-3. 모델 연결 및 실행

Hugging Face 백엔드를 설치한 환경에서, `eval-project/`를 현재 디렉터리로 두고 실행하는 예시다. 예시 모델은 [Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)이며, 아래 명령은 CUDA 환경을 가정한다.

```bash
pip install "lm_eval[hf]"

lm-eval run \
  --model hf \
  --model_args pretrained=Qwen/Qwen2.5-1.5B-Instruct \
  --apply_chat_template \
  --include_path ./tasks \
  --tasks company_qa \
  --device cuda:0 \
  --batch_size 1 \
  --output_path ./results/company_qa \
  --log_samples
```

`--include_path`로 외부 task 디렉터리를 알려주고, `--tasks`로 실행할 task를 지정한다. Instruct 모델의 입력 형식은 `--apply_chat_template`로 적용하며, `--log_samples`로 문항별 입력과 응답을 저장할 수 있다. [실행 옵션 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/interface.md)

이렇게 구성하면 같은 평가셋과 채점 기준을 유지하면서 모델을 바꾸어 실행할 수 있다. 다만 모델별 chat template이나 생성 옵션이 다르면 결과에도 영향을 주므로, 모델 이름만 기록해서는 비교 조건을 충분히 설명하기 어렵다.

<br>

# 4. 채점 로직도 업무에 맞춰 바꾸기

단답형 문제에서도 출력 형식에 따라 점수가 달라질 수 있다.

```text
정답: OOMKilled

응답 A: "OOMKilled"
응답 B: " oomkilled "
응답 C: "OOMKilled가 아니라 애플리케이션 오류입니다."
```

평가 기준에서 대소문자와 앞뒤 공백을 무시하기로 했다면 A와 B를 같은 답으로 처리할 수 있다. 반면 C는 정답 단어를 포함하지만 의미는 다르다. **정답 문자열이 들어 있는지만 확인하면 이런 응답까지 정답으로 처리하게 된다.**

정규화 규칙을 직접 구현하려면, 예를 들어 `tasks/utils.py`를 추가할 수 있다.

```python
import unicodedata


def normalize_answer(text):
    return unicodedata.normalize("NFC", text).strip().casefold()


def process_results(doc, results):
    prediction = results[0]
    target = doc["answer"]
    score = float(
        normalize_answer(prediction) == normalize_answer(target)
    )
    return {"normalized_exact_match": score}
```

기존 YAML에 `process_results`를 추가하고, `metric_list`를 아래 내용으로 교체한다.

```yaml
process_results: !function utils.process_results

metric_list:
  - metric: normalized_exact_match
    aggregation: mean
    higher_is_better: true
```

이 예시는 앞뒤 공백, 대소문자, 유니코드 표현 차이만 정규화한다. `OOMKilled입니다`처럼 설명이 붙은 답변은 여전히 오답이다. 허용할 표현을 늘릴지는 평가 목적에 맞게 정해야 한다. `!function`을 통한 함수 연결은 [신규 Task 작성 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/new_task_guide.md), 사용자 정의 `process_results`의 호출 흐름은 [Task 구현 코드](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/lm_eval/api/task.py)에서 확인할 수 있다.

채점 기준을 만들 때는 정상 답변뿐 아니라 **부정문, 빈 응답, 파싱 실패, 여러 답을 동시에 제시한 응답**도 확인해야 한다. 후처리 코드의 실수가 모델 점수의 차이처럼 보일 수 있기 때문이다.

## LLM-as-a-Judge는 언제 사용할까?

긴 설명의 정확성이나 해결 절차의 적절성처럼 문자열 비교로 판단하기 어려운 항목은, 별도의 LLM에 채점을 맡기는 방식을 고려할 수 있다. 이를 **LLM-as-a-Judge**라고 부른다.

예를 들어 장애 원인 설명을 평가한다면, 다음처럼 기준을 먼저 정의할 수 있다.

| 점수 | 채점 기준 예시 |
| --- | --- |
| 0점 | 원인을 잘못 설명하거나 제공된 상태와 모순됨 |
| 1점 | 원인은 맞지만 이를 뒷받침하는 관측 근거가 부족함 |
| 2점 | 원인과 관측 근거를 연결하고, 주어진 정보의 한계도 구분함 |

이 경우 judge에게 질문, 관측 정보, 기준 답안, 모델 응답, 채점 기준을 함께 전달한다. 반환된 점수뿐 아니라 채점 근거도 저장하고, 사람이 검토한 일부 문항과 비교해 기준이 제대로 적용되는지 확인하는 방식으로 설계할 수 있다.

앞서 본 **answer extraction**은 응답에서 선택지나 최종 답을 꺼내는 작업이고, 여기서의 **judge**는 답변의 품질을 판단하는 작업이다. 둘 다 LLM을 사용할 수 있지만 역할은 구분해서 기록해야 한다.

<br>

# 5. 사내 모델 어댑터 연결하기

평가셋이 준비되어 있어도, 사내 모델의 호출 방식이 프레임워크와 맞지 않으면 연결하는 코드가 필요하다.

```text
프레임워크의 추론 요청
        ↓
모델 어댑터: 프롬프트·이미지·생성 옵션 변환
        ↓
사내 추론 서버 호출
        ↓
모델 어댑터: 응답에서 생성 결과 추출
        ↓
프레임워크가 기대하는 결과 반환
```

이때 모델 어댑터가 맡을 일은 요청과 응답의 형식 변환뿐 아니라, 배치 응답의 순서 유지, 종료 조건, 출력 길이 제한, 타임아웃과 실패 처리까지 포함할 수 있다. 정답과 비교하는 로직은 task의 채점 부분에 둔다.

사내 서버가 기존 백엔드와 호환되는 API를 제공한다면 설정만으로 연결할 수도 있다. 별도 구현이 필요하다면 LM-Eval-Harness의 `generate_until` 같은 요청 인터페이스에 맞춰 확장한다. 다만 텍스트 생성만 제공하는 API로 선택지의 로그 확률을 요구하는 task까지 실행할 수 있는 것은 아니다. [모델 어댑터 작성 문서](https://github.com/EleutherAI/lm-evaluation-harness/blob/main/docs/model_guide.md)

VLM에서는 이미지 해상도, 여러 이미지의 순서, 영상 프레임 추출 방식도 입력 조건이 된다. 같은 문서라도 한 모델에는 원본 이미지를, 다른 모델에는 축소된 이미지를 전달했다면 그 차이를 함께 남겨야 한다.

<br>

# 6. Kubernetes 장애 대응 평가로 확장한다면

업무 평가를 설계하는 예시로, AI Agent의 Kubernetes 장애 대응 능력을 생각해볼 수 있다.

```text
장애 시나리오
    ↓
사용자 질문 + 관측한 클러스터 상태
    ↓
모델의 원인 분석·진단 명령·해결 절차
    ↓
항목별 채점
```

예를 들어 `OOMKilled`, 이미지 다운로드 실패, 잘못된 Service selector 등을 시나리오로 만들고, 각 문항에 확인 가능한 상태와 기대하는 판단을 정의한다.

| 평가 항목 | 확인할 내용 |
| --- | --- |
| 원인 분석 | 관측 정보로 뒷받침되는 원인을 설명했는가 |
| 진단 명령 | 적절한 리소스와 namespace를 조회하는가 |
| 해결 절차 | 원인에 맞는 변경과 변경 후 확인 절차를 제시하는가 |
| 근거 없는 주장 | 제공되지 않은 로그나 실행 결과를 사실처럼 말하는가 |
| 제약 준수 | 읽기 전용 조사처럼 시나리오에 정한 조건을 지키는가 |

명령어는 문자열 하나만 정답으로 정하기 어렵다. 예를 들어 `kubectl get pods -n demo`와 `kubectl -n demo get pods`는 표현 순서가 다르다. 따라서 명령, 대상 리소스, namespace, 옵션 등을 구분해 평가하거나, 통제된 환경에서 실행 결과를 확인하도록 설계할 수 있다.

**답변을 잘 작성하는지와 실제 장애를 복구하는지는 별도로 측정해야 한다.**

고정된 클러스터 상태를 입력하고 답변을 채점하면 오프라인 QA 평가다. Agent가 명령을 실행하고 새 관측을 받아 다음 행동을 결정하는 능력까지 보려면, 도구 실행과 다중 턴을 처리하는 환경도 필요하다. 이 실행 루프를 별도로 구현하거나 확장한 뒤 평가 파이프라인과 연결해야 한다.

복구 성공률을 측정하려면 시나리오마다 환경을 초기화하고, 서비스 정상화 여부를 외부에서 확인하는 기준도 있어야 한다. 모델이 출력한 “복구했습니다”라는 문장만으로 성공을 판정할 수는 없다.

<br>

# 7. 점수와 함께 관리해야 하는 것

평가 코드를 작성한 다음에는, 같은 조건으로 다시 실행할 수 있도록 구성해야 한다.

| 관리할 항목 | 남겨야 하는 이유 |
| --- | --- |
| 평가셋 버전과 분할 | 프롬프트를 수정하며 본 개발용 문항과 최종 평가 문항을 구분하기 위해 |
| 프레임워크·task·채점 코드 버전 | 입력 처리나 채점 규칙의 변경을 추적하기 위해 |
| 모델 버전과 생성 설정 | 모델 교체, chat template, 출력 길이 등의 영향을 확인하기 위해 |
| judge 모델과 채점 프롬프트 | 채점 조건의 변화를 확인하기 위해 |
| 원본 응답·파싱 결과·호출 오류 | 오답, 후처리 실패, 추론 실패를 구분하기 위해 |
| 유형별 점수와 문항 수 | 일부 유형의 성능 저하가 전체 평균에 가려지는지 확인하기 위해 |

API 호출 실패를 집계에서 조용히 제외하면 정상 응답만으로 계산한 점수가 된다. 전체 요청 수, 성공 응답 수, 호출 실패율을 함께 남기고, 실패를 최종 점수에 어떻게 반영할지도 미리 정해야 한다.

모델을 바꾸거나 프롬프트를 수정할 때 이 평가를 다시 실행하도록 CI나 학습 파이프라인에 연결할 수 있다. 모델 간 응답이 얼마나 일치하는지 비교하는 교차 검증을 추가할 수도 있지만, 여러 모델의 의견이 같다는 사실만으로 정답이 보장되지는 않는다. 업무에서 확인한 기준 답안이나 별도의 검증 수단이 필요하다.

결국 평가셋을 추가한다는 것은 **업무에서 기대하는 행동과 정답의 기준을 반복 실행 가능한 코드로 옮기는 작업**이다. 어떤 문제를 넣었는지, 무엇을 정답으로 인정했는지, 실패를 어떻게 집계했는지까지 남겨야 그 점수를 모델 선택이나 서비스 개선에 사용할 수 있다.
