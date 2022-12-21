import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DefaultText }  from './default-text';
import { Notice } from './notice';
import { ButtonWithCenteredText } from './button/centered-text';

const style: StyleProp<ViewStyle> = {
  paddingTop: 10,
  alignItems: 'stretch',
  width: '100%',
  maxWidth: 600,
  alignSelf: 'center',
};

const loadMoreStyle = {
  marginLeft: '25%',
  marginRight: '25%',
  marginTop: 5,
  marginBottom: 40,
};

type DefaultFlatListProps<ItemT> =
  Omit<
    FlatListProps<ItemT> & {
      emptyText: string,
      endText?: string,
      fetchPage: (pageNumber: number) => Promise<ItemT[]>,
      firstPage?: number,
      initialNumberOfPages?: number
      hideListHeaderComponentWhenEmpty?: boolean,
      dataKey?: string,
      disableRefresh?: boolean,
      innerRef?: any,
    },
    | "ListEmptyComponent"
    | "ListFooterComponent"
    | "data"
    | "keyExtractor"
    | "onContentSizeChange"
    | "onRefresh"
    | "refreshing"
  >;

const ActivityIndicator_ = () => {
  const style = useRef(
    {
      marginTop: 20,
      marginBottom: 20,
    }
  ).current;

  return (
    <View style={style}>
      <ActivityIndicator size="large" color="#70f" />
    </View>
  );
}

const DefaultFlatList = <ItemT,>(props: DefaultFlatListProps<ItemT>) => {
  const flatList = useRef(null);
  const [datas, setDatas] = useState<{[dataKey: string]: ItemT[]} >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastFetchedPageNumbers = useRef<{[dataKey: string]: number} >({});
  const lastFetchedPages = useRef<{[dataKey: string]: ItemT[]} >({});
  const isFetchingRef = useRef<{[dataKey: string]: boolean}>({});
  const [isFetchingOnPressState, setIsFetchingOnPressState] = useState<
    {[dataKey: string]: boolean}
  >({});
  const contentContainerStyle = useRef([
    style,
    props.contentContainerStyle,
  ]);
  // A horrible hack. Fuck React Native.
  const scrollToEndNTimes = useRef<{[dataKey: string]: number}>({});

  const dataKey = props.dataKey ?? 'default-key';
  const data = datas[dataKey];

  scrollToEndNTimes.current[dataKey] = scrollToEndNTimes.current[dataKey] ?? 2;

  const onEndReachedThreshold = props.onEndReachedThreshold ?? 1;
  const firstPage = props.firstPage ?? 1;
  const initialNumberOfPages = props.initialNumberOfPages ?? 1;

  const keyExtractor = useCallback((item: ItemT, index: number) => {
    return String(props.inverted ? data.length - index : index);
  }, [data?.length ?? -1, props.inverted]);

  const fetchNextPage = useCallback(async () => {
    if (lastFetchedPages.current[dataKey]?.length === 0) {
      return;
    }
    if (isFetchingRef.current[dataKey]) {
      return;
    }

    const pageNumberDelta = props.inverted ? -1 : 1;

    const pageNumberToFetch = lastFetchedPageNumbers.current[dataKey] === undefined ?
      firstPage :
      lastFetchedPageNumbers.current[dataKey] + pageNumberDelta;

    isFetchingRef.current[dataKey] = true;
    const page = await props.fetchPage(pageNumberToFetch);
    isFetchingRef.current[dataKey] = false;

    lastFetchedPageNumbers.current[dataKey] = page.length === 0 ?
      lastFetchedPageNumbers.current[dataKey] :
      pageNumberToFetch;
    lastFetchedPages.current[dataKey] = page;

    setDatas(datas => {
      const newDatas = {...datas};
      if (pageNumberToFetch === firstPage) {
        newDatas[dataKey] = page;
      } else if (props.inverted) {
        newDatas[dataKey] = [...page, ...newDatas[dataKey]];
      } else {
        newDatas[dataKey] = [...newDatas[dataKey], ...page];
      }
      return newDatas;
    })
  }, [props.fetchPage, firstPage, dataKey]);

  const onPressLoadMore = useCallback(async () => {
    setIsFetchingOnPressState(state => {
      const newState = {...state};
      newState[dataKey] = true;
      return newState;
    });
    await fetchNextPage();
    setIsFetchingOnPressState(state => {
      const newState = {...state};
      newState[dataKey] = false;
      return newState;
    });
  }, [fetchNextPage]);

  const onRefresh_ = useCallback(async () => {
    setIsRefreshing(true);

    lastFetchedPageNumbers.current[dataKey] = 0;
    await fetchNextPage();

    setIsRefreshing(false);
  }, [fetchNextPage, dataKey]);
  const onRefresh = props.disableRefresh === true ? undefined : onRefresh_;

  const ListEmptyComponent = useCallback(() => {
    return (
      <DefaultText
        style={{
          fontFamily: 'Trueno',
          margin: '20%',
          textAlign: 'center'
        }}
      >
        {props.emptyText}
      </DefaultText>
    );
  }, [props.emptyText]);

  const EndTextNotice = useCallback(() => {
    if (props.endText) {
      return (
        <Notice
          style={{
            marginTop: 5,
            marginBottom: 5,
            marginRight: 0,
          }}
        >
          <DefaultText style={{color: '#70f'}} >
            {props.endText}
          </DefaultText>
        </Notice>
      );
    } else {
      return <></>;
    }
  }, [props.endText]);

  const ListHeaderComponent = useCallback(() => {
    const ListHeaderComponent_ = () => {
      if (isValidElement(props.ListHeaderComponent)) {
        return props.ListHeaderComponent;
      } else if (props.ListHeaderComponent) {
        return <props.ListHeaderComponent/>;
      } else {
        return <></>;
      }
    };

    if (data !== undefined && data.length === 0) {
      return props.hideListHeaderComponentWhenEmpty === true ?
        <></> :
        <ListHeaderComponent_/>;
    } else if (
      lastFetchedPages.current[dataKey] !== undefined &&
      lastFetchedPages.current[dataKey].length === 0 &&
      props.inverted
    ) {
      return (
        <>
          <ListHeaderComponent_/>
          <EndTextNotice/>
        </>
      );
    } else if (props.inverted && !isFetchingOnPressState[dataKey]) {
      return (
        <>
          <ListHeaderComponent_/>
          <ButtonWithCenteredText
            onPress={onPressLoadMore}
            containerStyle={loadMoreStyle}
          >
            Load More...
          </ButtonWithCenteredText>
        </>
      );
    } else if (props.inverted && isFetchingOnPressState[dataKey]) {
      return (
        <>
          <ListHeaderComponent_/>
          <ActivityIndicator_/>
        </>
      );
    } else {
      return <ListHeaderComponent_/>;
    }
  }, [
    props.ListHeaderComponent,
    props.hideListHeaderComponentWhenEmpty,
    isFetchingOnPressState[dataKey],
  ]);

  const ListFooterComponent = useCallback(() => {
    if (data !== undefined && data.length === 0) {
      return <></>;
    } else if (
      lastFetchedPages.current[dataKey] !== undefined &&
      lastFetchedPages.current[dataKey].length === 0 &&
      !props.inverted
    ) {
      return <EndTextNotice/>;
    } else if (!props.inverted) {
      return <ActivityIndicator_/>;
    } else {
      return <></>;
    }
  }, [data, dataKey, lastFetchedPages.current[dataKey], props.inverted]);

  const onContentSizeChange = useCallback(() => {
    if (!flatList.current) return;
    if (!props.inverted) return;

    if (scrollToEndNTimes.current[dataKey] > 0) {
      // React Native is buggy crap. `scrollToEnd` doesn't work with
      // `ListHeaderComponent`.
      flatList.current.scrollToOffset({offset: 999999});
      scrollToEndNTimes.current[dataKey] -= 1;
    }
  }, [
    flatList.current,
    props.inverted,
    scrollToEndNTimes.current[dataKey],
  ]);

  const onEndReached = props.inverted ? undefined : fetchNextPage;

  const append = useCallback((item: ItemT) => {
    scrollToEndNTimes.current[dataKey] = 1;
    setDatas(datas => {
      const newDatas = {...datas};
      newDatas[dataKey] = [...newDatas[dataKey], item];
      return newDatas;
    });
  }, [dataKey]);
  if (props.innerRef) {
    props.innerRef.current = { append };
  }

  if (props.contentContainerStyle !== contentContainerStyle[1]) {
    contentContainerStyle.current = [style, props.contentContainerStyle];
  }

  useEffect(() => {
    if (
      data === undefined ||
      Math.abs(
        firstPage - (lastFetchedPageNumbers.current[dataKey] ?? firstPage)
      ) < initialNumberOfPages - 1
    ) {
      fetchNextPage();
    }
  }, [
    data,
    firstPage,
    lastFetchedPageNumbers.current[dataKey],
    initialNumberOfPages,
    fetchNextPage
  ]);

  if (data === undefined) {
    return (
      <View
        style={[
          {
            marginTop: 20,
            marginBottom: 20,
          },
          style,
        ]}
      >
        <ActivityIndicator size="large" color="#70f" />
      </View>
    );
  } else {
    return (
      <FlatList
        ref={flatList}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        onEndReachedThreshold={onEndReachedThreshold}
        onEndReached={onEndReached}
        data={data}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        {...props}
        inverted={false}
        contentContainerStyle={contentContainerStyle.current}
        ListHeaderComponent={ListHeaderComponent}
        onContentSizeChange={onContentSizeChange}
        keyExtractor={keyExtractor}
      />
    );
  }
};

export {
  DefaultFlatList,
  DefaultFlatListProps,
};
