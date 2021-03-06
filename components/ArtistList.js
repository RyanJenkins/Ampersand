import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Text,
  View,
  SectionList,
  TouchableOpacity,
  ListItem,
  StyleSheet
} from 'react-native'

import { fetchArtists } from '../data-access/instance-interactions'
import getConnection from '../data-access/database'
import globalStyles from '../styles/globalStyles'

class ArtistList extends Component {
  componentWillMount() {
    this.setState({artists: []})

    getConnection()
      .then(db => db.executeSql('SELECT * FROM artists'))
      .then(([results]) => {
        this.setState({artists: results.rows.raw() })
      })
  }

  renderItem({ item }) {
    const goToArtist = this.props.setView.bind(
      null,
      'ALBUMS_FOR_ARTIST',
      {artistId: item.ampache_id})

    return (
      <TouchableOpacity onPress={goToArtist}>
        <View style={globalStyles.listItem}>
          <Text>{item.name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  renderSectionHeader({ section }) {
    return (
      <View style={globalStyles.sectionHeading}>
        <Text>{section.title}</Text>
      </View>
    )
  }

  render() {
    const sections = [{
      title: 'Artists',
      data: this.state.artists
    }]

    return (
      <View style={styles.container}>
        <SectionList
          renderItem={this.renderItem.bind(this)}
          renderSectionHeader={this.renderSectionHeader.bind(this)}
          sections={sections}
          keyExtractor={(item, index) => index} />
      </View>
    )
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

const mapDispatchToProps = dispatch => ({
  setView: (viewName, viewParams) =>
    dispatch({type: 'SET_VIEW', viewName, viewParams})
})

export default connect(null, mapDispatchToProps)(ArtistList)

