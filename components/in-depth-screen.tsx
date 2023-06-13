import {
  Animated,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import { TopNavBar } from './top-nav-bar';
import { DefaultText } from './default-text';
import { ButtonGroup } from './button-group';
import { SendIntroButtonSpacer } from './send-intro-button-spacer';
import { AnsweredQuizCard } from './quiz-card';
import { DefaultFlatList } from './default-flat-list';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ArrowLeft, ArrowRight } from "react-native-feather";

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const sideMargins: StyleProp<ViewStyle> = {
  marginLeft: 10,
  marginRight: 10,
};

const answeredQuizCard = (props: {
  children: any,
  questionNumber: number
  topic: string,
  user1: string,
  answer1: string,
  user2: string,
  answer2: string,
}) => <AnsweredQuizCard {...props}/>;

const AnsweredQuizCardMemo = memo(answeredQuizCard);

const Subtitle = ({children}) => {
  return (
    <DefaultText
      style={{
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 15,
        color: '#888',
        ...sideMargins,
      }}
    >
      {children}
    </DefaultText>
  );
};

const Header = ({
  name,
  idx1,
  idx2,
  idx3,
  idx4,
  onChangeIdx1,
  onChangeIdx2,
  onChangeIdx3,
  onChangeIdx4,
}) => {
  const answersSubtitle = () => {
    var result = name.endsWith('s') ? `${name}' ` : `${name}'s `;

    if (idx3 === 1) result += "Values-Related ";
    if (idx3 === 2) result += "Sex-Related ";
    if (idx3 === 3) result += "Interpersonal ";
    if (idx3 === 4) result += "Other ";

    result += "Q&A Answers";

    if (idx2 === 1) result += " Which You Agree With Each Other About";
    if (idx2 === 2) result += " Which You Disagree With Each Other About";
    if (idx2 === 3) result += " Which You Haven't Answered";

    return result
  };

  const analysisSubtitle = () => {
    if (idx4 === 0) return 'MBTI (Myers–Briggs Type Indicator)';
    if (idx4 === 1) return 'Big 5 Personality Traits';
    if (idx4 === 2) return 'Attachment Style';
    if (idx4 === 3) return 'Politics';
    if (idx4 === 4) return 'Other Traits';
  };

  const subtitle = idx1 === 0 ? answersSubtitle() : analysisSubtitle();

  const determiner = name.endsWith('s') ? "'" : "'s";

  return (
    <>
      <TopNavBar
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          minHeight: 40,
          height: undefined,
        }}
        borderColor="transparent"
        shadow={false}
      >
        <DefaultText
          style={{
            width: '100%',
            paddingLeft: 50,
            paddingRight: 50,
            fontWeight: '700',
            fontSize: 20,
            textAlign: 'center',
          }}
        >
          You + {name}
        </DefaultText>
      </TopNavBar>
      <ButtonGroup
        buttons={['Q&A Answers\n(342)', 'Personality']}
        selectedIndex={idx1}
        onPress={onChangeIdx1}
        containerStyle={sideMargins}
      />
      {idx1 === 0 && <>
        <ButtonGroup
          buttons={['All\n(342)', 'Agree\n(332)', 'Disagree\n(10)', 'Unanswered\n(0)']}
          selectedIndex={idx2}
          onPress={onChangeIdx2}
          containerStyle={sideMargins}
          secondary={true}
        />
        <ButtonGroup
          buttons={['All\n(342)', 'Values\n(0)', 'Sex\n(342)', 'Interp.\n(0)', 'Other\n(0)']}
          selectedIndex={idx3}
          onPress={onChangeIdx3}
          containerStyle={sideMargins}
          secondary={true}
        />
      </>}
      {idx1 === 1 && <>
        <ButtonGroup
          buttons={['MBTI', 'Big 5', 'Att.', 'Politics', 'Other']}
          selectedIndex={idx4}
          onPress={onChangeIdx4}
          containerStyle={sideMargins}
          secondary={true}
        />
        <ButtonGroup
          buttons={['Invisible']}
          selectedIndex={0}
          onPress={() => undefined}
          containerStyle={{
            ...sideMargins,
            opacity: 0
          }}
          secondary={true}
          pointerEvents="none"
        />
      </>}
      <Subtitle>{subtitle}</Subtitle>
    </>
  );
};

const fetchAnswersPage = async (n: number): Promise<any[]> => {
  return [...Array(10)].map((_, i) => {
    return {id: `${i + 10 * n}`, kind: 'answer'}
  });
};

const fetchPersonalityPage = (m: number) => async (n: number): Promise<any[]> => {
  if (n === 1) {
    if (m === 0) return [{id: 'a', kind: 'mbti'}];
    if (m === 1) return [{id: 'b', kind: 'big-5'}];
    if (m === 2) return [{id: 'd', kind: 'attachment-style'}];
    if (m === 3) return [{id: 'c', kind: 'politics'}];
    if (m === 4) return [{id: 'e', kind: 'other'}];
  }
  return [];
};

const InDepthScreen = (navigationRef) => ({navigation}) => {
  if (navigationRef)
    navigationRef.current = navigation;

  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [idx4, setIdx4] = useState(0);

  const renderItem = useCallback(({item}) => {
    switch (item.kind) {
      case 'answer':
        return <AnsweredQuizCardMemo
            questionNumber={1}
            topic="Ethics"
            user1="Rahim"
            answer1="yes"
            user2="You"
            answer2={undefined}
          >
            Are you gay? Are you gay? Are you gay? Are you and Shane gay?
          </AnsweredQuizCardMemo>;
      case 'mbti':
        return <MbtiMemo/>;
      case 'big-5':
        return <Big5Memo/>;
      case 'politics':
        return <PoliticsMemo/>;
      case 'attachment-style':
        return <AttachmentStyleMemo/>;
      case 'other':
        return <OtherTraitsMemo/>;
    }
  }, []);

  // TODO: Sometimes a spinner shows up at the bottom of the screen that won't go away
  return <DefaultFlatList
    contentContainerStyle={{
      paddingTop: 0,
      paddingBottom: 20,
    }}
    dataKey={
      idx1 === 1 ? `${idx1}-${idx4}` : `${idx1}-${idx2}-${idx3}`}
    emptyText={
      idx1 === 1 ? undefined : "No Q&A Answers to Show"}
    endText={
      idx1 === 1 ? undefined : "No More Q&A Answers to Show"}
    fetchPage={
      idx1 === 1 ? fetchPersonalityPage(idx4) : fetchAnswersPage}
    ListHeaderComponent={
      <Header
        name="Rahim"
        idx1={idx1}
        idx2={idx2}
        idx3={idx3}
        idx4={idx4}
        onChangeIdx1={setIdx1}
        onChangeIdx2={setIdx2}
        onChangeIdx3={setIdx3}
        onChangeIdx4={setIdx4}
      />
    }
    renderItem={renderItem}
    disableRefresh={true}
  />;
};

const Mbti = () => {
  return (
    <View style={sideMargins}>
      <Chart
        minLabel="Introversion"
        maxLabel="Extraversion"
        name1="You"
        ratio1={0.00}
        name2="Rahim"
        ratio2={undefined}
      >
        Measures a person's preference for engaging with the world, ranging from drawing energy from social interactions and being action-oriented (Extraversion) to finding energy in solitude and focusing on thoughts and feelings (Introversion).
      </Chart>
      <Chart
        minLabel="Thinking"
        maxLabel="Feeling"
        name1="You"
        ratio1={undefined}
        name2="Rahim"
        ratio2={1.00}
      >
        Reflects a person's decision-making style, encompassing both logical, objective analysis and rationality (Thinking) as well as empathy, values, and consideration for others' emotions (Feeling).
      </Chart>
      <Chart
        minLabel="Sensing"
        maxLabel="Intuition"
        name1="You"
        ratio1={0.50}
        name2="Rahim"
        ratio2={-1.0}
      >
        Represents an individual's preferred way of processing information, covering the spectrum from focusing on concrete, tangible details and experiences (Sensing) to exploring abstract concepts, patterns, and possibilities (Intuition).
      </Chart>
      <Chart
        minLabel="Judging"
        maxLabel="Perceiving"
        name1="You"
        ratio1={0.66}
        name2="Rahim"
        ratio2={0.97}
      >
        Captures an individual's approach to organizing and structuring their life, ranging from preferring a planned, orderly, and decisive lifestyle (Judging) to embracing spontaneity, flexibility, and adaptability (Perceiving).
      </Chart>
    </View>
  );
};

const Big5 = () => {
  return (
    <View style={sideMargins}>
      <Chart
        dimensionName="Openness to Experience"
        name1="You"
        ratio1={0.49}
        name2="Rahim"
        ratio2={0.51}
      >
        Describes a person's orientation towards new ideas, experiences, and feelings, capturing the spectrum from embracing novelty and change to appreciating tradition and predictability.
      </Chart>
      <Chart
        dimensionName="Conscientiousness"
        name1="You"
        ratio1={0.51}
        name2="Rahim"
        ratio2={0.49}
      >
        Represents an individual's approach to organization, reliability, and goal-setting, encompassing both highly structured and responsible behavior as well as a more flexible and spontaneous approach.
      </Chart>
      <Chart
        dimensionName="Extraversion"
        name1="You"
        ratio1={0.89}
        name2="Rahim"
        ratio2={0.19}
      >
        Reflects a person's social preferences, acknowledging that people vary in their need for social interaction, from enjoying solitude and introspection to actively seeking engagement with others.
      </Chart>
      <Chart
        dimensionName="Agreeableness"
        name1="You"
        ratio1={0.89}
        name2="Rahim"
        ratio2={0.19}
      >
        Captures an individual's range of social behaviors, from demonstrating empathy, cooperation, and consideration for others to expressing assertiveness and independence in social situations.
      </Chart>
      <Chart
        dimensionName="Neuroticism"
        name1="You"
        ratio1={0.89}
        name2="Rahim"
        ratio2={0.19}
      >
        Depicts the diversity in how people experience and cope with emotions, spanning the range from calmness and emotional steadiness to sensitivity and emotional responsiveness.
      </Chart>
    </View>
  );
};

const AttachmentStyle = () => {
  return (
    <View style={sideMargins}>
      <Chart
        dimensionName="Anxious"
        name1="You"
        ratio1={0.98}
        name2="Rahim"
        ratio2={0.07}
      >
        Measures the extent to which a person seeks reassurance and fears abandonment in close relationships. If a person scores low on this and the "avoidant" scale, they're said to be "securely" attached. Secure attachment is associated with longer, more stable relationships.
      </Chart>
      <Chart
        dimensionName="Avoidant"
        name1="You"
        ratio1={0.89}
        name2="Rahim"
        ratio2={0.03}
      >
        Measures the preference for emotional distance and self-reliance in relationships. If a person scores low on this and the "anxious" scale, they're said to be "securely" attached. Secure attachment is associated with longer, more stable relationships.
      </Chart>
    </View>
  );
};

const Politics = () => {
  return (
    <View style={sideMargins}>
      <Chart
        minLabel="Individualism"
        maxLabel="Collectivism"
        name1="You"
        ratio1={0.66}
        name2="Rahim"
        ratio2={-0.75}
      >
        Measures a person's preference for individual rights and freedoms versus collective good and social cohesion.
      </Chart>
      <Chart
        minLabel="Libertarianism"
        maxLabel="Authoritarianism"
        name1="You"
        ratio1={-0.66}
        name2="Rahim"
        ratio2={0.75}
      >
        Measures preference for individual liberties and minimal government intervention versus strong central authority and extensive government control.
      </Chart>
      <Chart
        minLabel="Environmentalism"
        maxLabel="Anthropocentrism"
        name1="You"
        ratio1={0.66}
        name2="Rahim"
        ratio2={0.75}
      >
        Measures prioritization of preserving the environment and non-human species versus human-centered resource utilization and economic development.
      </Chart>
      <Chart
        minLabel="Isolationism"
        maxLabel="Internationalism"
        name1="You"
        ratio1={1.00}
        name2="Rahim"
        ratio2={0.00}
      >
        Measures preference for national self-reliance and limited global engagement versus active participation in international affairs and cooperation.
      </Chart>
      <Chart
        minLabel="Security"
        maxLabel="Freedom"
        name1="You"
        ratio1={1.00}
        name2="Rahim"
        ratio2={0.00}
      >
        Measures how much a person values national security and public safety versus individual freedoms and civil liberties.
      </Chart>
      <Chart
        minLabel="Non-interventionism"
        maxLabel="Interventionism"
        name1="You"
        ratio1={1.00}
        name2="Rahim"
        ratio2={0.00}
      >
        Measures a person's preference for an active foreign policy with military and diplomatic interventions versus a non-interventionist approach that emphasizes diplomacy and trade.
      </Chart>
      <Chart
        minLabel="Equity"
        maxLabel="Meritocracy"
        name1="You"
        ratio1={1.00}
        name2="Rahim"
        ratio2={0.00}
      >
        Measures a person's preference for a system that rewards individuals based on their abilities and achievements versus a system that prioritizes fairness and equal opportunities for everyone.
      </Chart>
    </View>
  );
};

const OtherTraits = () => {
  return (
    <View style={sideMargins}>
      {
        [
          'Empathy',
          'Honesty',
          'Humility',
          'Independence',
          'Optimism',
          'Patience',
          'Persistence',
          'Playfulness',
          'Adherence to Own Principles',
          'Rationality',
          'Religiosity',
          'Self-acceptance',
          'Sex-focus',
          'Thriftiness',
          'Thrill-seeking',
        ].map((trait, i) => <Chart
            key={i}
            dimensionName={trait}
            name1="You"
            ratio1={getRandomInt(100) / 100}
            name2="Rahim"
            ratio2={getRandomInt(100) / 100}
          />
        )
      }
    </View>
  );
};


const Chart = ({name1, ratio1, name2, ratio2, ...props}) => {
  const {
    children,
    dimensionName,
    minLabel,
    maxLabel,
  } = props;

  const [expanded, setExpanded] = useState(false);
  const [bump, setBump] = useState<number>(0.0);

  const { opacity, scaleXY } = LayoutAnimation.Properties;
  const { easeInEaseOut, linear } = LayoutAnimation.Types;

  const animatedBackgroundColor = useRef(new Animated.Value(1)).current;
  const animatedBumpOpacity = useRef(new Animated.Value(0)).current;
  const animatedBumpScale = useRef(new Animated.Value(0)).current;

  const backgroundColor = animatedBackgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(222,222,222, 1)', 'rgba(255,255,255, 1)'],
    extrapolate: 'clamp',
  });

  const bumpLeftOpacity = animatedBumpOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.2],
    extrapolate: 'clamp',
  });

  const bumpRightOpacity = animatedBumpOpacity.interpolate({
    inputRange: [-1, 0],
    outputRange: [0.2, 1],
    extrapolate: 'clamp',
  });

  const bumpLeftScale = animatedBumpScale.interpolate({
    inputRange: [-1, 1],
    outputRange: [1.3, 0.7],
    extrapolate: 'clamp',
  });

  const bumpRightScale = animatedBumpScale.interpolate({
    inputRange: [-1, 1],
    outputRange: [0.7, 1.3],
    extrapolate: 'clamp',
  });

  const onPressChart = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 100,
      update: { type: easeInEaseOut, property: scaleXY }
    });
    setExpanded(expanded => !expanded);
  }, [setExpanded]);

  const onPressInChart = useCallback(() => {
    Animated.timing(animatedBackgroundColor, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, []);

  const onPressOutChart = useCallback(() => {
    Animated.timing(animatedBackgroundColor, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, []);

  if (dimensionName && (minLabel || maxLabel)) {
    throw new Error("dimensionName can't be set at the same time as minLabel or maxLabel");
  }

  const clamp = (x: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, x));
  };

  const stylePercentage = (ratio: number | undefined) => {
    if (ratio === undefined) return undefined;
    return clamp(100 * (dimensionName ? ratio : ((ratio + 1) / 2)), 0, 100);
  };

  const labelPercentage = (ratio: number | undefined) => {
    if (ratio === undefined) return undefined;
    return clamp(Math.round(Math.abs(100 * ratio)), 0, 100);
  };

  const bumpEqualsZero = useCallback((bump: number) => {
    return Math.abs(bump) < 1e-5;
  }, []);

  const canBumpUp =
    bump < +1e-5 && ((ratio2 ?? 0) + bump) < (1 - 1e-5);

  const canBumpDown =
    bump > -1e-5 && ((ratio2 ?? 0) + bump) > ((dimensionName ? 0 : -1) + 1e-5);

  useEffect(() => {
    const animatedValueOpacity = (() => {
      if (canBumpUp && canBumpDown) return 0;
      return canBumpUp ? 1 : -1;
    })();
    const animatedValueScale = (() => {
      if (bumpEqualsZero(bump)) return 0;
      return bump > 1e-5 ? 1 : -1;
    })();

    Animated.parallel([
      Animated.timing(animatedBumpOpacity, {
        toValue: animatedValueOpacity,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(animatedBumpScale, {
        toValue: animatedValueScale,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [canBumpUp, canBumpDown, bump]);

  const bumpX = useCallback((currentBump: number, bumpSize: number) => {
    LayoutAnimation.configureNext({
      duration: 100,
      create: { type: linear, property: opacity },
      update: { type: easeInEaseOut, property: scaleXY },
      delete: { type: linear, property: opacity }
    });

    if (bumpEqualsZero(currentBump)) {
      let bumpResult = (ratio2 ?? 0) + bumpSize;
      bumpResult = clamp(bumpResult, dimensionName ? 0 : -1, 1);
      return bumpResult - (ratio2 ?? 0);
    } else if (currentBump > 0) {
      if (bumpSize > 1e-5) {
        return currentBump;
      } else {
        return 0;
      }
    } else if (currentBump < 0) {
      if (bumpSize < 1e-5) {
        return currentBump;
      } else {
        return 0;
      }
    } else {
      return 0; // Should never happen
    }
  }, [ratio2, dimensionName]);

  const bumpLeft  = useCallback(() => {
    setBump((bump) => bumpX(bump, -0.1));
  }, [bumpX]);

  const bumpRight = useCallback(() => {
    setBump((bump) => bumpX(bump, +0.1));
  }, [bumpX]);

  const minLabel_ = minLabel ? `100%` : '0%';
  const maxLabel_ = maxLabel ? `100%` : '100%';

  const Tick = useCallback(({position, color, ...props}) => {
    const {label, labelPercentage, extraHeight} = props;

    const position_ = position && Math.round(position);
    const extraHeight_ = extraHeight || 0;

    const labelPosition = position_ < 50 ?
      {left: `${position_}%`} :
      {right: `${100 - position_}%`};

    return <>
      {
        position_ !== undefined && <View
          style={{
            position: 'absolute',
            left: `${position_}%`,
            marginLeft: label === undefined ? 0 : -1,
            backgroundColor: color,
            top: 40 - extraHeight_,
            width: label === undefined ? 1 : 3,
            height: 11 + extraHeight_,
          }}
        />
      }
      {
        position_ !== undefined && label && <DefaultText
          style={{
            position: 'absolute',
            ...labelPosition,
            top: 20 - extraHeight_,
            color: color,
            fontWeight: '600',
          }}
        >
          {label} <DefaultText style={{fontWeight: '400'}}>
            ({labelPercentage}%)
          </DefaultText>
        </DefaultText>
      }
      {
        position_ === undefined && label && <View
          style={{
            width: '100%',
            position: 'absolute',
            top: 20 - extraHeight_,
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          <DefaultText
            style={{
              color: color,
              fontWeight: '600',
            }}
          >
            {label} <DefaultText style={{fontWeight: '400'}}>
              (Not enough Q&A answers)
            </DefaultText>
          </DefaultText>
        </View>
      }
    </>
  }, []);

  return (
    <Animated.View
      style={{
        backgroundColor: backgroundColor,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
      }}
    >
      <Pressable
        style={{
          padding: 10,
        }}
        onPress={onPressChart}
        onPressIn={onPressInChart}
        onPressOut={onPressOutChart}
      >
      <View
        style={{
          width: '100%',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: 45,
            backgroundColor: '#ddd',
            height: 1,
            width: '100%',
          }}
        />

        {!bumpEqualsZero(bump) &&
          <Tick
            color="#70f"
            position={stylePercentage((ratio2 ?? 0) + bump)}
            label={name2}
            labelPercentage={
              `${labelPercentage(ratio2 ?? 0)}` +
              (bump < 0 && dimensionName ? ' - ' : ' + ') +
              `${labelPercentage(bump)}`}
            extraHeight={20}/>
        }
        <Tick
          color="#70f"
          position={stylePercentage(ratio2)}
          label={bumpEqualsZero(bump) ? name2 : ""}
          labelPercentage={labelPercentage(ratio2)}
          extraHeight={bumpEqualsZero(bump) ? 20 : 0}/>
        <Tick
          color="#666"
          position={stylePercentage(ratio1)}
          label={name1}
          labelPercentage={labelPercentage(ratio1)}
          extraHeight={0}/>

        <Tick color="#ddd" position={0}/>
        <Tick color="#ddd" position={50}/>
        <Tick color="#ddd" position={100}/>

        <View
          style={{
            marginTop: 60,
            flexDirection: 'row',
          }}
        >
          <DefaultText style={{flex: 1, textAlign: 'left', color: "#666"}}>
            {minLabel_}
          </DefaultText>
          {(minLabel || maxLabel) &&
            <DefaultText style={{flex: 3, textAlign: 'center', color: "#666"}}>
              0%
            </DefaultText>
          }
          {!minLabel && !maxLabel &&
            <DefaultText style={{flex: 3, textAlign: 'center', fontWeight: '500'}}>
              {dimensionName}
            </DefaultText>
          }
          <DefaultText style={{flex: 1, textAlign: 'right', color: "#666"}}>
            {maxLabel_}
          </DefaultText>
        </View>

        {minLabel && maxLabel &&
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <DefaultText style={{ fontWeight: '500'}}>
              {minLabel}
            </DefaultText>
            <DefaultText style={{ fontWeight: '500'}}>
              {maxLabel}
            </DefaultText>
          </View>
        }
      </View>
      {expanded && <>
          <DefaultText
            style={{
              color: '#888',
              marginTop: 25,
              alignSelf: 'stretch',
            }}
          >
            {children}

            {children && '\n\n'}Duolicious whips-up this score using three
            ingredients: Rahim's Q&A answers, your score-bumps, and our
            smartypants AI. (We use a few tricks to improve accuracy and
            fairness, so bumps will take some time to influence Rahim's score.)
          </DefaultText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            <Pressable onPress={bumpLeft} style={{padding: 20}}>
              <Animated.View style={{
                opacity: bumpLeftOpacity,
                transform: [ { scale: bumpLeftScale } ]
              }}>
                <ArrowLeft
                  stroke="#70f"
                  strokeWidth={4}
                  width={30}
                  height={30}
                />
              </Animated.View>
            </Pressable>
            <DefaultText
              style={{
                fontFamily: 'TruenoBold',
                color: '#70f',
                textAlign: 'center',
              }}
            >
              Bump Rahim's Score
            </DefaultText>
            <Pressable onPress={bumpRight} style={{padding: 20}}>
              <Animated.View style={{
                opacity: bumpRightOpacity,
                transform: [ { scale: bumpRightScale } ]
              }}>
                <ArrowRight
                  stroke="#70f"
                  strokeWidth={4}
                  width={30}
                  height={30}
                />
              </Animated.View>
            </Pressable>
          </View>
        </>
      }
      <View
        style={{
          marginTop: 5,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DefaultText>
          {expanded ? 'Hide' : 'Show'} Trait Info
        </DefaultText>
        <Ionicons
          style={{
            color: 'black',
            fontSize: 16,
          }}
          name={expanded ? 'chevron-up' : 'chevron-down'}
        />
      </View>
      </Pressable>
    </Animated.View>
  );
};

const MbtiMemo = memo(Mbti);
const Big5Memo = memo(Big5);
const PoliticsMemo = memo(Politics);
const AttachmentStyleMemo = memo(AttachmentStyle);
const OtherTraitsMemo = memo(OtherTraits);

export {
  InDepthScreen,
};