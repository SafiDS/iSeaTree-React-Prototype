/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
import React from 'react'

import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  Text as RNText,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Subheading, useTheme, Button, TextInput, DefaultTheme, Badge } from 'react-native-paper'

import { StatusBar } from '../components/StatusBar'
import { colors } from '../styles/theme'
import speciesDataList from '../../data/species.json'
import { CONFIG } from '../../envVariables'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { ScrollView } from 'react-native-gesture-handler'

const info_image = require('../../assets/info.png')
const arrow_up = require('../../assets/arrow_up.png')
const arrow_down = require('../../assets/arrow_down.png')
const search_image = require('../../assets/trees.png')
const treeConifer = require('../../assets/tree_Conifer3X-01.png')
const treeBroadleaf = require('../../assets/tree_Deciduous3X-01.png')

export interface SpeciesData {
  ID: string
  TYPE: string
  COMMON: string
  DESCRIPTION: string
  SCIENTIFIC: string
  LEVEL?: string
  ITREECODE?: string
  FULL_PIC_180x110?: string
  FULL_PIC_1024x768?: string
  THUMB_PIC_1024x768?: string
  LEAF_COLOR?: string
  TREE_SHAPE?: string
}

interface SpeciesSelectProps {
  speciesType: null | string
  speciesData: null | SpeciesData
  onSelect: (speciesData: null | SpeciesData) => void
}

const MIN_SEARCH_TERM_LENGTH = 3

function getSpeciesFlatListData(
  type: string | null,
  query?: string,
): { ID: string; COMMON: string; SCIENTIFIC: string; TYPE: string }[] {
  const $speciesDataList: { ID: string; COMMON: string; SCIENTIFIC: string; TYPE: string }[] = []
  speciesDataList.forEach((item) => {
    if (typeof type == 'string') {
      if (type.toLowerCase() == item.TYPE.toLowerCase() || item.TYPE.toLowerCase() === 'unknown') {
        $speciesDataList.push(item)
      } else if (type.toLowerCase() == 'null') {
        $speciesDataList.push(item)
      }
    } else {
      $speciesDataList.push(item)
    }
  })

  if (!query) {
    return $speciesDataList
  }

  const inputValue = query.trim().toLowerCase()
  const inputLength = inputValue.length

  if (inputLength < MIN_SEARCH_TERM_LENGTH) {
    return $speciesDataList
  }

  return $speciesDataList.filter(
    (datum) =>
      datum.COMMON.toLowerCase().includes(inputValue) ||
      datum.SCIENTIFIC.toLowerCase().includes(inputValue),
  )
}

export function getSpeciesNames(speciesNameId: string): undefined | SpeciesData {
  return speciesDataList.find((speciesDatum) => speciesDatum.ID === speciesNameId)
}
const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window')

const styles = StyleSheet.create({
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTile: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '82%',
    paddingLeft: 10,
    marginRight: 10,
  },
  listItemTitle: {
    fontSize: 16,
    color: DefaultTheme.colors.text,
    marginBottom: 5,
  },
  listItemDescription: {
    fontSize: 16,
    color: DefaultTheme.colors.backdrop,
  },
  smallImage: {
    width: 90,
    height: 55,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
})

function getTreeBadgeColor(level: string) {
  switch (level.toLowerCase()) {
    case 'easy':
      return '#C6F6D5'

    case 'medium':
      return '#FEEBC8'

    case 'expert':
      return '#FEB2B2'

    default:
      return '#ddd'
  }
}

function rendergramtext(level: string) {
  switch (level.toLowerCase()) {
    case 'easy':
      return 'an easy'

    case 'medium':
      return 'a medium'

    case 'expert':
      return 'an expert'

    default:
      return ''
  }
}

export function IdentifySpecies(props: any) {
  const [query, setQuery] = React.useState<undefined | string>(undefined)
  const [isSelected, setisSelected] = React.useState<null | Boolean>(false)
  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(true)
  const [secondaryModalVisibility, setSecondaryModalVisibility] = React.useState<boolean>(false)
  const [thirdModalVisibility, setThirdModalVisibility] = React.useState<boolean>(false)

  const [isInfo, setInfo] = React.useState<boolean>(false)
  const [currentScreen, setCurrentScreen] = React.useState(0)
  const [currentData, setCurrentData] = React.useState<SpeciesData>()
  const [loading, setLoading] = React.useState<boolean>(false)

  const theme = useTheme()

  const currentSpeciesNamesItems = React.useMemo(() => {
    const { params } = props.route
    return getSpeciesFlatListData(params.treeType, query)
  }, [query, isModalVisible])

  function handleSpeciesSelect(speciesData: SpeciesData) {
    const { params } = props.route
    if (!isSelected) {
      params.onSelect(speciesData)
      props.navigation.goBack()
      setisSelected(true)
    }
    setTimeout(() => {
      setisSelected(false)
    }, 1000)
  }

  function renderFlatListItem({ item }: { item: SpeciesData }) {
    const imageUrl = `${CONFIG.AWS_S3_URL}` + item.FULL_PIC_180x110

    return (
      <TouchableHighlight
        key={item.ID}
        onPress={() => {
          handleSpeciesSelect(item)
        }}
        underlayColor={colors.gray[500]}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.listItem,
            {
              backgroundColor: item.ID === props.speciesData?.ID ? colors.green[100] : '#fff',
            },
          ]}
        >
          {item.FULL_PIC_180x110 ? (
            <TouchableOpacity
              onPress={() => {
                setCurrentScreen(0)
                setCurrentData(item)
                setSecondaryModalVisibility(true)
                setInfo(false)
              }}
            >
              <Image source={{ uri: imageUrl }} style={styles.smallImage} />
            </TouchableOpacity>
          ) : (
            <></>
          )}
          <View style={styles.listTile}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '90%' }}>
              <RNText style={styles.listItemTitle}>{item.COMMON}</RNText>
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '80%' }}>
              <RNText style={styles.listItemDescription}>{item.SCIENTIFIC}</RNText>
            </ScrollView>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  function onLoading(value, label) {
    setLoading(value)
  }

  const renderItem = ({ item }) => {
    const imgURL = `${CONFIG.AWS_S3_URL}` + item
    let treeDetailImg = ''
    switch (currentData?.TYPE) {
      case 'conifer':
        treeDetailImg = treeConifer
        break
      case 'broadleaf':
        treeDetailImg = treeBroadleaf
        break
    }
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imgURL }}
          style={styles.image}
          resizeMode={'cover'}
          onLoadStart={() => onLoading(true, 'onLoadStart')}
          onLoadEnd={() => onLoading(false, 'onLoadStart')}
        ></Image>
        {loading && (
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              zIndex: 0,
              width: '100%',
              position: 'absolute',
              height: 350,
            }}
          >
            <ActivityIndicator color={'green'} />
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            setThirdModalVisibility(true)
          }}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 5,
            position: 'absolute',
            top: 15,
            right: 15,
            backgroundColor: 'white',
            borderRadius: 30,
            height: 60,
            width: 60,
            borderColor: 'black',
            borderWidth: 2,
          }}
        >
          <Image
            style={{
              resizeMode: 'contain',
              height: '100%',
              width: '100%',
            }}
            source={treeDetailImg}
          />
        </TouchableOpacity>
      </View>
    )
  }

  const pagination = () => {
    return (
      <Pagination
        dotsLength={imageArray.length}
        activeDotIndex={currentScreen}
        containerStyle={{
          backgroundColor: 'transparent',
        }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: -5,
          backgroundColor: '#4A5568',
        }}
        inactiveDotStyle={{
          width: 12,
          height: 12,
          borderRadius: 8,
          backgroundColor: '#A0AEC0',
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    )
  }
  const imageUrl1 = currentData ? `${CONFIG.AWS_S3_URL}` + currentData?.FULL_PIC_1024x768 : ''
  const imageUrl2 = currentData ? `${CONFIG.AWS_S3_URL}` + currentData?.FULL_PIC_180x110 : ''
  const imageArray = currentData?.THUMB_PIC_1024x768
    ? currentData?.THUMB_PIC_1024x768.split(',')
    : []
  if (currentData?.FULL_PIC_1024x768) {
    imageArray.unshift(currentData?.FULL_PIC_1024x768)
  }
  let treeDetailImg = ''
  switch (currentData?.TYPE) {
    case 'conifer':
      treeDetailImg = treeConifer
      break
    case 'broadleaf':
      treeDetailImg = treeBroadleaf
      break
  }
  return (
    <View>
      <Subheading>Species</Subheading>

      <View
        style={{
          marginTop: 5,
        }}
      >
        {!!props.speciesData?.LEVEL && (
          <Badge
            visible
            style={{
              marginBottom: 5,
              backgroundColor: getTreeBadgeColor(props.speciesData?.LEVEL),
            }}
          >
            {`You've found ${rendergramtext(props.speciesData.LEVEL)}-level tree!`}
          </Badge>
        )}

        <Modal visible={isModalVisible} animationType="slide">
          <Modal animationType="slide" transparent={true} visible={secondaryModalVisibility}>
            <Modal animationType="slide" transparent={true} visible={thirdModalVisibility}>
              <StatusBar />
              <View
                style={{
                  flex: 1,
                  height: '60%',
                  backgroundColor: 'white',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: viewportWidth / 1.5,
                      height: viewportWidth / 2,
                      overflow: 'hidden',
                      borderRadius: 20,
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl1 }}
                      style={{ height: '100%', width: '100%' }}
                      resizeMode={'cover'}
                      onLoadStart={() => onLoading(true, 'onLoadStart')}
                      onLoadEnd={() => onLoading(false, 'onLoadStart')}
                    />

                    {loading && (
                      <View
                        style={{
                          justifyContent: 'center',
                          alignSelf: 'center',
                          alignContent: 'center',
                          zIndex: 0,
                          width: '100%',
                          position: 'absolute',
                          height: viewportWidth / 2,
                        }}
                      >
                        <ActivityIndicator color={'green'} />
                      </View>
                    )}
                  </View>
                  {!loading && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        right: -10,
                      }}
                    >
                      <Image
                        source={search_image}
                        style={{ height: 100, width: 100 }}
                        resizeMode={'contain'}
                      />
                    </View>
                  )}
                </View>
              </View>
              <View
                style={{ height: '60%', width: '100%', backgroundColor: 'white', paddingTop: 50 }}
              >
                <View
                  style={{
                    alignItems: 'baseline',
                    marginHorizontal: 20,
                  }}
                >
                  {currentData?.TYPE ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Image
                        source={treeDetailImg}
                        style={{ height: 80, width: 80 }}
                        resizeMode={'contain'}
                      />
                      <View style={{ marginLeft: 5, width: '82%' }}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>Type</RNText>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.TYPE}
                        </RNText>
                      </View>
                    </View>
                  ) : null}
                  {currentData?.COMMON ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Image
                        source={treeDetailImg}
                        style={{ height: 80, width: 80 }}
                        resizeMode={'contain'}
                      />
                      <View style={{ marginLeft: 5, width: '82%' }}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>Common</RNText>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.COMMON}
                        </RNText>
                      </View>
                    </View>
                  ) : null}
                  {currentData?.SCIENTIFIC ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Image
                        source={treeDetailImg}
                        style={{ height: 80, width: 80 }}
                        resizeMode={'contain'}
                      />
                      <View style={{ marginLeft: 5, width: '82%' }}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>Scientific</RNText>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.SCIENTIFIC}
                        </RNText>
                      </View>
                    </View>
                  ) : null}
                  {currentData?.LEAF_COLOR ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Image
                        source={treeDetailImg}
                        style={{ height: 80, width: 80 }}
                        resizeMode={'contain'}
                      />
                      <View style={{ marginLeft: 5, width: '82%' }}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>Leaf Color</RNText>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.LEAF_COLOR}
                        </RNText>
                      </View>
                    </View>
                  ) : null}
                  {currentData?.TREE_SHAPE ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 20,
                      }}
                    >
                      <Image
                        source={treeDetailImg}
                        style={{ height: 80, width: 80 }}
                        resizeMode={'contain'}
                      />
                      <View style={{ marginLeft: 5, width: '82%' }}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>Tree Shape</RNText>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.TREE_SHAPE}
                        </RNText>
                      </View>
                    </View>
                  ) : null}
                </View>

                <Button
                  mode="contained"
                  style={{
                    borderRadius: 0,
                    //  alignContent: 'center',
                    width: viewportWidth,
                    alignSelf: 'center',
                    // height: 45,
                    padding: 10,
                    paddingBottom: 20,
                    // left: -60,
                    position: 'absolute',
                    bottom: 0,
                  }}
                  onPress={() => {
                    setThirdModalVisibility(false)
                  }}
                >
                  CLOSE
                </Button>
              </View>
            </Modal>
            <StatusBar />
            <View
              style={{
                flex: 1,
                height: '100%',
                backgroundColor: 'white',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  width: '100%',
                  height: '70%',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Carousel
                  data={imageArray}
                  renderItem={renderItem}
                  itemWidth={viewportWidth * 1}
                  sliderWidth={viewportWidth}
                  loop={true}
                  pagingEnabled
                  firstItem={currentScreen}
                  initialNumToRender={currentScreen}
                  onSnapToItem={(index) => setCurrentScreen(index)}
                />
                <View
                  style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    bottom: 0,
                  }}
                >
                  {pagination()}
                </View>
              </View>
              <View style={{ height: isInfo ? '40%' : '18%', width: '100%' }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: 10,
                      marginLeft: 10,
                      width: '90%',
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl2 }}
                      style={{ height: 40, width: 60 }}
                      resizeMode={'contain'}
                    />
                    <View
                      style={{ marginLeft: 10, width: '80%', marginRight: 10, marginBottom: 10 }}
                    >
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <RNText style={{ fontWeight: 'bold', fontSize: 16 }}>
                          {currentData?.COMMON}
                        </RNText>
                      </ScrollView>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <RNText style={{ fontSize: 16, color: '#7F7F7F' }}>
                          {currentData?.SCIENTIFIC}
                        </RNText>
                      </ScrollView>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      //  flexDirection: 'row',
                      justifyContent: 'center',
                      marginRight: 10,
                      alignItems: 'center',
                      marginTop: 10,
                    }}
                    onPress={() => {
                      setInfo((current) => !current)
                    }}
                  >
                    <Image
                      source={info_image}
                      style={{ height: 20, width: 20 }}
                      resizeMode={'contain'}
                    />
                    {isInfo ? (
                      <Image
                        source={arrow_up}
                        style={{ height: 15, width: 15 }}
                        resizeMode={'contain'}
                      />
                    ) : (
                      <Image
                        source={arrow_down}
                        style={{ height: 15, width: 15 }}
                        resizeMode={'contain'}
                      />
                    )}
                  </TouchableOpacity>
                </View>
                {isInfo ? (
                  // <View
                  //   style={{ marginTop: 15, marginHorizontal: 10, height: 180, marginBottom: 100 }}
                  // >
                  <ScrollView
                    style={{ marginTop: 15, marginHorizontal: 10, height: 180, marginBottom: 88 }}
                    showsVerticalScrollIndicator={true}
                  >
                    <RNText style={{ fontWeight: 'normal', fontSize: 16 }}>
                      {currentData?.DESCRIPTION}
                    </RNText>
                  </ScrollView>
                ) : // </View>
                  null}
                <Button
                  mode="contained"
                  style={{
                    borderRadius: 0,
                    width: viewportWidth,
                    alignSelf: 'center',
                    padding: 10,
                    paddingBottom: 20,
                    position: 'absolute',
                    bottom: 0,
                  }}
                  onPress={() => {
                    setSecondaryModalVisibility(false)
                  }}
                >
                  CLOSE
                </Button>
              </View>
            </View>
          </Modal>

          <StatusBar />

          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <Button mode="contained" style={{ borderRadius: 0 }}>
              done
            </Button>

            <TextInput
              value={query}
              onChangeText={(value) => setQuery(value)}
              placeholder="search..."
              mode="flat"
              style={{ backgroundColor: theme.colors.background }}
              theme={{ roundness: 0 }}
              autoCorrect={false}
            />

            <FlatList
              data={currentSpeciesNamesItems}
              keyExtractor={(item, index) => `${item.ID}-${index}`}
              renderItem={renderFlatListItem}
              initialNumToRender={20}
            />
          </View>
        </Modal>
      </View>
    </View>
  )
}
